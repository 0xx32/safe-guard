import { format as formatDate } from '@formkit/tempo'
import { subscriptionsTable, tariffsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { CallbackData, InlineKeyboard } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { subscriptionMessage } from '@/shared/messages/subscription'

const subscriptionShowData = new CallbackData('subscription_show').number('id')

export default (bot: BotType) => {
	bot
		.callbackQuery('my_subscriptions', async (ctx) => {
			await ctx.answerCallbackQuery()

			const subscriptions = await db
				.select({
					id: subscriptionsTable.id,
					status: subscriptionsTable.status,
					tariff: {
						id: tariffsTable.id,
						name: tariffsTable.label,
					},
				})
				.from(subscriptionsTable)
				.leftJoin(tariffsTable, eq(subscriptionsTable.tariffId, tariffsTable.id))
				.where(eq(subscriptionsTable.userId, ctx.user.id))

			if (!subscriptions.length) {
				return ctx.editText('У вас нет подписок 😔', {
					reply_markup: new InlineKeyboard().text('Назад', 'profile'),
				})
			}

			await ctx.editText('Ваши подписки', {
				reply_markup: new InlineKeyboard()
					.combine(
						new InlineKeyboard().columns(1).add(
							...subscriptions.map((x) => {
								return {
									text: `ID: ${x.id} | тариф: ${x.tariff?.name}`,
									callback_data: subscriptionShowData.pack({ id: x.id }),
								}
							})
						)
					)

					.row()
					.text('Назад', 'profile'),
			})
		})
		.callbackQuery(subscriptionShowData, async (ctx) => {
			const subscriptions = await db
				.select({
					id: subscriptionsTable.id,
					status: subscriptionsTable.status,
					subUrl: subscriptionsTable.subUrl,
					endDate: subscriptionsTable.endDate,
					uuid: subscriptionsTable.uuid,
					tariff: {
						id: tariffsTable.id,
						name: tariffsTable.label,
					},
				})
				.from(subscriptionsTable)
				.leftJoin(tariffsTable, eq(subscriptionsTable.tariffId, tariffsTable.id))
				.where(eq(subscriptionsTable.id, ctx.queryData.id))

			const subscription = subscriptions[0]

			if (!subscription || !subscription.tariff) {
				return ctx.editText('Подписка не найдена', {
					reply_markup: new InlineKeyboard().text('Назад', 'profile'),
				})
			}

			if (subscription.status === 'expired') {
				return ctx.editText('Подписка закончилась', {
					reply_markup: new InlineKeyboard()
						.text('Продлить?', 'sunscription_renewal')
						.row()
						.text('Назад', 'my_subscriptions'),
				})
			}

			const message = subscriptionMessage({
				title: `📋Подробности подписки`,
				uuid: subscription.uuid,
				endDate: formatDate(subscription.endDate, 'long'),
				tariff: subscription.tariff?.name,
				protocol: 'VLESS',
				subUrl: subscription.subUrl,
			})

			await ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.url('Как подключиться', subscription.subUrl)
					.row()
					.text('Назад', 'profile'),
			})
		})
}
