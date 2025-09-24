import { format as formatDate } from '@formkit/tempo'
import { internalSquadsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, CallbackData, format, InlineKeyboard, join } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { updateUserBalance } from '@/db/helpers/user'
import { subscriptionsService } from '@/services/subscriptions'
import { subscriptionMessage } from '@/shared/messages/subscription'

const selectingPeriodData = new CallbackData('selecting_period').number('id')
const selectingLocationData = new CallbackData('selecting_location').number('id')
const selectingProtocolData = new CallbackData('selecting_protocol').number('id')
const subscriptionPaymentData = new CallbackData('subscription_payment').number('amount')
const orderConfirmationData = new CallbackData('order_confirmation').number('orderAmount')

export default (bot: BotType) => {
	bot
		.callbackQuery('buy_subscription', async (ctx) => {
			await ctx.editText('Выберите страну', {
				reply_markup: new InlineKeyboard()
					.combine(
						new InlineKeyboard().columns(2).add(
							...Object.values(ctx.config.locations).map((location) => ({
								text: `${location.icon} ${location.name} ${location.supplementToPrice === 0 ? '' : `+  (${location.supplementToPrice} ₽)`}`,
								callback_data: selectingLocationData.pack({ id: location.id }),
							}))
						)
					)
					.row()
					.text('🔙 Назад', 'main'),
			})

			await ctx.answerCallbackQuery()
		})
		.callbackQuery(selectingLocationData, async (ctx) => {
			ctx.session.cart.locationId = ctx.queryData.id

			await ctx.editText('Выберите период', {
				reply_markup: new InlineKeyboard()
					.add(
						...Object.entries(ctx.config.periods).map(([key, value]) => ({
							text: `${value.title} / ${value.price} ₽`,
							callback_data: selectingPeriodData.pack({ id: +key }),
						}))
					)
					.columns(2),
			})
			await ctx.answerCallbackQuery()
		})
		.callbackQuery(selectingPeriodData, async (ctx) => {
			ctx.session.cart.periodId = ctx.queryData.id

			await ctx.editText('Выберите протокол', {
				reply_markup: new InlineKeyboard().columns(2).add(
					...Object.entries(ctx.config.protocols).map(([key, value]) => ({
						text: value,
						callback_data: selectingProtocolData.pack({ id: +key }),
					}))
				),
			})
			await ctx.answerCallbackQuery()
		})
		.callbackQuery(selectingProtocolData, async (ctx) => {
			ctx.session.cart.protocolId = ctx.queryData.id

			const { locationId, periodId, protocolId } = ctx.session.cart

			if (!locationId || !periodId || !protocolId) {
				return ctx.editText('Ошибка в оформении заказа', {
					reply_markup: new InlineKeyboard().text('Вернуться в главное меню', 'main'),
				})
			}

			const config = ctx.config

			const selectedLocation = config.locations[locationId]
			const amount = config.periods[periodId]!.price + selectedLocation!.supplementToPrice

			const data = [
				`📅 Период: ${config.periods[periodId]!.title}`,
				`🌎 Страна: ${selectedLocation!.name}`,
				`⚙️ Протокол: ${config.protocols[protocolId]}`,
				`💰 Сумма: ${amount} ₽`,
			]

			await ctx.editText(
				format`📋 ${bold`Сводка заказа`}\n\n ${join(data, (x) => bold`${x}`, '\n')}`,
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
				return ctx.editCaption(`На вашем балансе недостаточно средств`, {
					reply_markup: new InlineKeyboard()
						.text(
							'Перейти к оплате',
							subscriptionPaymentData.pack({ amount: ctx.queryData.orderAmount })
						)
						.text('Вернуться в главное меню', 'main'),
				})
			}

			const afterBalance = ctx.user.balance - ctx.queryData.orderAmount

			const updateUser = await updateUserBalance(ctx.user.id, afterBalance)

			if (updateUser && updateUser.balance !== afterBalance) {
				return ctx.editText('Ошибка при оплате, обратитесь в поддержку', {
					reply_markup: new InlineKeyboard()
						.text('Вернуться в главное меню', 'main')
						.url('Поддержка', 'https://t.me/safeguard_ru'),
				})
			}
			await ctx.answerCallbackQuery('Оплата успешно произведена')

			//TODO: Отрефакторить и добавить логирование
			const internalSquads = await db
				.select({ id: internalSquadsTable.uuid })
				.from(internalSquadsTable)
				.where(
					eq(
						internalSquadsTable.locationCode,
						ctx.config.locations[ctx.session.cart.locationId]!.code
					)
				)

			const internalSquadsIds = internalSquads.map((squad) => squad.id)

			//TODO: Добавить логирование
			const newSubscription = await subscriptionsService.createSubscription({
				locationId: ctx.session.cart.locationId,
				protocolId: ctx.session.cart.protocolId,
				userId: ctx.user.id,
				telegramId: ctx.from.id,
				username: ctx.user.telegramUsername,
				internalSquadsIds,
			})

			const message = subscriptionMessage({
				endDate: formatDate(newSubscription.endData, 'long'),
				location: ctx.config.locations[newSubscription.locationId]!.name,
				protocol: ctx.config.protocols[newSubscription.protocolId]!,
				subUrl: newSubscription.subUrl,
			})

			await ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.text('Как подключиться', 'my_subscriptions')
					.text('Назад', 'main'),
			})

			ctx.session.cart = {
				locationId: 0,
				periodId: 0,
				protocolId: 0,
			}
		})
	//TODO: Доделать переход на оплату если баланс = 0 и выдача подписки
	// .callbackQuery(subscriptionPaymentData, async (ctx) => {})
}
