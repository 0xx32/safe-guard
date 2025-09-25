import { format as formatDate } from '@formkit/tempo'
import { subscriptionsTable } from '@repo/db/schemes'
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
				.select()
				.from(subscriptionsTable)
				.where(eq(subscriptionsTable.userId, ctx.user!.id))

			if (!subscriptions.length) {
				return ctx.editText('У вас нет подписок 😔', {
					reply_markup: new InlineKeyboard().text('Назад', 'profile'),
				})
			}

			await ctx.editText('Ваши подписки', {
				reply_markup: new InlineKeyboard()
					.columns(2)
					.add(
						...subscriptions.map((x) => {
							const location = ctx.config.locations[x.locationId]
							const protocol = ctx.config.protocols[x.protocolId]

							return {
								text: `${location?.name} / ${protocol}`,
								callback_data: subscriptionShowData.pack({ id: x.id }),
							}
						})
					)
					.text('Назад', 'profile'),
			})
		})
		.callbackQuery(subscriptionShowData, async (ctx) => {
			const result = await db
				.select()
				.from(subscriptionsTable)
				.where(eq(subscriptionsTable.id, ctx.queryData.id))
			const subscription = result[0]

			if (!subscription) {
				return ctx.editText('Подписка не найдена', {
					reply_markup: new InlineKeyboard().text('Назад', 'profile'),
				})
			}

			const message = subscriptionMessage({
				title: `📋Подробности подписки - ${subscription.id}`,
				endDate: formatDate(subscription.endDate, 'long'),
				location: `${ctx.config.locations[subscription.locationId]!.icon}${ctx.config.locations[subscription.locationId]!.name}`,
				protocol: ctx.config.protocols[subscription.protocolId]!,
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
