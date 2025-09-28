import { addDay, addMonth, format as formatDate } from '@formkit/tempo'
import { periodsTable, tariffsTable, usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, CallbackData, format, InlineKeyboard, join } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { getPeriodById } from '@/db/helpers/period'
import { getTariffById, getTariffs } from '@/db/helpers/tariff'
import { updateUserBalance } from '@/db/helpers/user'
import { topupBalanceScene } from '@/scenes'
import { subscriptionsService } from '@/services/subscriptions.service'
import { backKeyboard, errorKeyboard } from '@/shared/keyboards'
// import { locationsKeyboard } from '@/shared/keyboards/buy-subscription'
import { subscriptionMessage } from '@/shared/messages/subscription'
import { getTotalSubscriptionPrice } from '@/utils/helpers/getTotalSubscriptionPrice'

const selectingPeriodData = new CallbackData('selecting_period').number('periodId')
const subscriptionPaymentData = new CallbackData('subscription_payment').number('amount')
const orderConfirmationData = new CallbackData('order_confirmation').number('orderAmount')
const selectingTariff = new CallbackData('selecting_tariff').number('tariffId')

export default (bot: BotType) => {
	bot
		//Выбор тарифа
		.callbackQuery('buy_subscription', async (ctx) => {
			const tariffs = await getTariffs()

			await ctx.answerCallbackQuery()

			if (!tariffs.length) {
				return ctx.editText('Нет доступных тарифов', {
					reply_markup: new InlineKeyboard().text('🔙 Назад', 'main'),
				})
			}

			const filteredTariffs = tariffs.filter((tariff) => tariff.isActive && !tariff.isPrivate)

			return ctx.editText(`Выберите тариф`, {
				reply_markup: new InlineKeyboard()
					.combine(
						new InlineKeyboard().columns(2).add(
							...filteredTariffs.map((tariff) => ({
								text: `${tariff.label} - 1мес / ${tariff.priceInMonth} ₽`,
								callback_data: selectingTariff.pack({ tariffId: tariff.id }),
							}))
						)
					)
					.row()
					.text('🔙 Назад', 'main'),
			})
		})
		//Выбор протокола
		.callbackQuery(selectingTariff, async (ctx) => {
			ctx.session.cart.tariffId = ctx.queryData.tariffId

			const tariff = await getTariffById(ctx.queryData.tariffId)
			if (!tariff) {
				return ctx.editText('Ошибка при получении данных о тарифе', {
					reply_markup: new InlineKeyboard().text('🔙 Назад', 'main'),
				})
			}

			const periods = await db.select().from(periodsTable)

			await ctx.answerCallbackQuery()

			if (!periods.length) {
				return ctx.editText('Нет доступных периодов', {
					reply_markup: new InlineKeyboard().text('🔙 Назад', 'main'),
				})
			}

			return ctx.editText(`Выберите период подписки`, {
				reply_markup: new InlineKeyboard()
					.combine(
						new InlineKeyboard().columns(2).add(
							...periods.map((period) => {
								const price = getTotalSubscriptionPrice(
									tariff.priceInMonth,
									period.durationInDays,
									period.discount
								)
								return {
									text: `🗓 ${period.durationInDays} дней - ${price} ₽`,
									callback_data: selectingPeriodData.pack({ periodId: period.id }),
								}
							})
						)
					)
					.row()
					.text('🔙 Назад', 'buy_subscription'),
			})
		})
		//Подтверждение заказа
		.callbackQuery(selectingPeriodData, async (ctx) => {
			ctx.session.cart.periodId = ctx.queryData.periodId

			const cart = ctx.session.cart

			if (!cart.periodId || !cart.tariffId) {
				return ctx.editText('Ошибка в оформении заказа', {
					reply_markup: new InlineKeyboard().text('Вернуться в главное меню', 'main'),
				})
			}

			const [period, tariff] = await Promise.all([
				getPeriodById(cart.periodId),
				getTariffById(cart.tariffId),
			])

			if (!tariff || !period) {
				return ctx.editText('Ошибка при получении данных о настройке подписки', {
					reply_markup: new InlineKeyboard().text('Вернуться в главное меню', 'main'),
				})
			}

			const amount = getTotalSubscriptionPrice(
				tariff.priceInMonth,
				period.durationInDays,
				period.discount
			)

			const text = [
				`🌎 Тариф: ${tariff.label}`,
				`📅 Период: ${period.durationInDays} дней`,
				`⚙️ Протокол: VLESS`,
				`💰 Сумма: ${amount} ₽`,
			]

			await ctx.editText(
				format`📋 ${bold`Сводка заказа`}\n\n ${join(text, (x) => bold`${x}`, '\n')}`,
				{
					reply_markup: new InlineKeyboard()
						.text('✅ Подтвердить', orderConfirmationData.pack({ orderAmount: amount }))
						.text('❌ Отменить', 'main'),
				}
			)
			await ctx.answerCallbackQuery()
		})

		.callbackQuery(orderConfirmationData, async (ctx) => {
			if (ctx.user?.balance < ctx.queryData.orderAmount) {
				const paymentAmount = ctx.queryData.orderAmount - ctx.user.balance

				return ctx.editText(
					`На вашем балансе недостаточно средств 😔\n\nТекущий баланс: ${ctx.user.balance}\nВам нужно пополнить баланс на: ${paymentAmount} ₽`,
					{
						reply_markup: new InlineKeyboard()
							.text(
								`Пополнить на ${paymentAmount} ₽`,
								subscriptionPaymentData.pack({ amount: paymentAmount })
							)
							.row()
							.text('Вернуться в главное меню', 'main'),
					}
				)
			}

			const afterBalance = ctx.user.balance - ctx.queryData.orderAmount

			const updateUser = await updateUserBalance(ctx.user.id, afterBalance)

			if (!updateUser || (updateUser && updateUser?.balance !== afterBalance)) {
				return ctx.editText(
					`Ошибка при оплате.\nОбратитесь в поддержку с вашим id: ${ctx.user.uuid}`,
					{
						reply_markup: errorKeyboard,
					}
				)
			}
			await ctx.answerCallbackQuery('Оплата успешно произведена')

			ctx.session.isWaitingForPayment = false

			const [period, tariff] = await Promise.all([
				getPeriodById(ctx.session.cart.periodId),
				getTariffById(ctx.session.cart.tariffId),
			])

			if (!tariff || !period) {
				return ctx.editText(
					`Ошибка при получении данных о настройке подписки\n
					Обратитесь в поддержку с вашим id: ${ctx.user.uuid}`,
					{
						reply_markup: errorKeyboard,
					}
				)
			}

			const newSubscription = await subscriptionsService.createSubscription({
				userId: ctx.user.id,
				telegramId: ctx.from.id,
				username: ctx.user.telegramUsername,
				internalSquadsIds: [tariff.squadUuid],
				endDate: addMonth(new Date(), period.durationInDays / 30),
				tariffId: tariff.id,
			})

			const message = subscriptionMessage({
				title: 'Ваша подписка активирована 🎉',
				endDate: formatDate(newSubscription.endData, 'long'),
				tariff: tariff.label,
				protocol: 'VLESS',
				subUrl: newSubscription.subUrl,
				uuid: newSubscription.uuid,
			})

			await ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.url('Как подключиться', newSubscription.subUrl)
					.row()
					.text('Назад', 'main'),
			})

			ctx.session.cart = {
				periodId: 0,
				tariffId: 0,
			}
		})
		.callbackQuery(subscriptionPaymentData, async (ctx) => {
			ctx.session.isWaitingForPayment = true
			return ctx.scene.enter(topupBalanceScene, {
				amount: ctx.queryData.amount,
			})
		})
		.callbackQuery('back_to_checkout', async (ctx) => {
			const [period, tariff] = await Promise.all([
				getPeriodById(ctx.session.cart.periodId),
				getTariffById(ctx.session.cart.tariffId),
			])

			if (!tariff || !period) {
				return ctx.editText(
					`Ошибка при получении данных о настройке подписки\n
					Обратитесь в поддержку с вашим id: ${ctx.user.uuid}`,
					{
						reply_markup: errorKeyboard,
					}
				)
			}

			const afterBalance =
				ctx.user.balance -
				getTotalSubscriptionPrice(tariff.priceInMonth, period.durationInDays, period.discount)
			const updateUser = await updateUserBalance(ctx.user.id, afterBalance)

			if (!updateUser || (updateUser && updateUser?.balance !== afterBalance)) {
				return ctx.editText(
					`Ошибка при оплате.\nОбратитесь в поддержку с вашим id: ${ctx.user.uuid}`,
					{
						reply_markup: errorKeyboard,
					}
				)
			}

			const newSubscription = await subscriptionsService.createSubscription({
				userId: ctx.user.id,
				telegramId: ctx.from.id,
				username: ctx.user.telegramUsername,
				internalSquadsIds: [tariff.squadUuid],
				endDate: addMonth(new Date(), period.durationInDays / 30),
				tariffId: tariff.id,
			})

			const message = subscriptionMessage({
				title: 'Ваша подписка активирована 🎉',
				endDate: formatDate(newSubscription.endData, 'long'),
				tariff: tariff.label,
				protocol: 'VLESS',
				subUrl: newSubscription.subUrl,
				uuid: newSubscription.uuid,
			})

			await ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.url('Как подключиться', newSubscription.subUrl)
					.row()
					.text('Назад', 'main'),
			})

			ctx.session.cart = {
				periodId: 0,
				tariffId: 0,
			}
		})
		.callbackQuery('trial_subscription', async (ctx) => {
			if (ctx.user.hasHadPaidSubscription || ctx.user.isUsedTrial) {
				return ctx.editText('Вам не доступна пробная подписка', {
					reply_markup: backKeyboard,
				})
			}

			const tarrifResult = await db
				.select()
				.from(tariffsTable)
				.where(eq(tariffsTable.isActive, true))

			const tariff = tarrifResult[0]

			if (!tariff) {
				return ctx.editText('Такой тариф не найден', {
					reply_markup: backKeyboard,
				})
			}

			await ctx.answerCallbackQuery()

			const newSubscription = await subscriptionsService.createSubscription({
				userId: ctx.user.id,
				telegramId: ctx.from.id,
				username: ctx.user.telegramUsername,
				internalSquadsIds: [tariff.squadUuid],
				endDate: addDay(new Date(), ctx.config.trialDurationDays),
				tariffId: tariff.id,
			})

			const message = subscriptionMessage({
				title: 'Ваша подписка активирована 🎉',
				endDate: formatDate(newSubscription.endData, 'long'),
				tariff: tariff.label,
				protocol: 'VLESS',
				subUrl: newSubscription.subUrl,
				uuid: newSubscription.uuid,
			})

			await ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.url('Как подключиться', newSubscription.subUrl)
					.row()
					.text('Назад', 'main'),
			})

			await db
				.update(usersTable)
				.set({
					isUsedTrial: true,
				})
				.where(eq(usersTable.id, ctx.user.id))
		})
}
