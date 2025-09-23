import { addMonth } from '@formkit/tempo'
import { subscriptionsTable } from '@repo/db/schemes'
import { bold, CallbackData, format, InlineKeyboard, join } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { getUserByTelegramId, updateUserBalance } from '@/db/helpers/user'
import { remnawave } from '@/services/remnawave'
import { topupBalanceData } from '@/shared/callbackData'
import { generateRandomString } from '@/utils/helpers/string'

const selectingPeriodData = new CallbackData('selecting_period').number('id')
const selectingLocationData = new CallbackData('selecting_location').number('id')
const selectingProtocolData = new CallbackData('selecting_protocol').number('id')
const subscriptionPaymentData = new CallbackData('subscription_payment').number('amount')

export default (bot: BotType) => {
	bot
		.callbackQuery('buy_subscription', async (ctx) => {
			await ctx.editText('Выберите страну', {
				reply_markup: new InlineKeyboard()
					.combine(
						new InlineKeyboard().columns(2).add(
							...Object.values(ctx.config.locations).map((location) => ({
								text: `${location.icon} ${location.name} + (${location.supplementToPrice} ₽)`,
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
						.text(
							'✅ Подтвердить',
							subscriptionPaymentData.pack({
								amount,
							})
						)
						.text('❌ Отменить', 'main'),
				}
			)
			await ctx.answerCallbackQuery()
		})
		.callbackQuery(subscriptionPaymentData, async (ctx) => {
			const user = await getUserByTelegramId(ctx.from.id)
			const amount = ctx.queryData.amount

			if (!user) {
				return ctx.editText('Вы не авторизованы', {
					reply_markup: new InlineKeyboard().text('Авторизоваться', 'auth'),
				})
			}

			if (user.balance < amount) {
				return ctx.editText(
					`❌ Недостаточно средств \n\nПополните баланс на ${amount} ₽ и попробуйте снова.`,
					{
						reply_markup: new InlineKeyboard()
							.text('Пополнить счет', topupBalanceData.pack({ amount }))
							.row()
							.text('Вернуться в главное меню', 'main'),
					}
				)
			}

			const updateUser = await updateUserBalance(user.id, user.balance - amount)

			if (!updateUser?.userBalance || updateUser.userBalance < user.balance - amount) {
				return ctx.editText('Ошибка при оплате', {
					reply_markup: new InlineKeyboard()
						.text('Вернуться в главное меню', 'main')
						.url('Поддержка', 'https://t.me/safeguard_ru'),
				})
			}

			await ctx.answerCallbackQuery('Оплата успешно произведена')

			const lastEndDate = addMonth(new Date(), 1)

			const remnawaveResponse = await remnawave.createUser({
				username: user.telegramUsername ?? generateRandomString(),
				expireAt: lastEndDate,
			})

			if (remnawaveResponse.status === 'error') {
				return ctx.editText('Ошибка при создании подписки\n\n Обратитесь в поддержку!!!', {
					reply_markup: new InlineKeyboard()
						.text('Вернуться в главное меню', 'main')
						.url('Поддержка', 'https://t.me/safeguard_ru'),
				})
			}

			await db.insert(subscriptionsTable).values({
				userId: user.id,
				status: 'active',
				startDate: new Date(remnawaveResponse.data.createdAt),
				endDate: lastEndDate,
				subUrl: remnawaveResponse.data.subscriptionUrl,
				remnawaveShortId: remnawaveResponse.data.shortUuid,
				remnawaveUuid: remnawaveResponse.data.uuid,
				locationId: ctx.session.cart.locationId,
				protocolId: ctx.session.cart.protocolId,
			})

			ctx.session.cart = {
				locationId: 0,
				periodId: 0,
				protocolId: 0,
			}

			return ctx.editText('Подписка активирована', {
				reply_markup: new InlineKeyboard().text('Мои подписки', 'my_subscriptions'),
			})
		})
}
