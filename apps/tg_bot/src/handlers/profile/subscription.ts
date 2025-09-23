import { format as formatDate } from '@formkit/tempo'
import { subscriptionsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, CallbackData, code, format, InlineKeyboard, join } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'

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
				return ctx.editText('У вас подписок', {
					reply_markup: new InlineKeyboard().text('Назад', 'profile'),
				})
			}

			await ctx.editText('Ваши подписки', {
				reply_markup: new InlineKeyboard().add(
					...subscriptions.map((x) => {
						const location = ctx.config.locations[x.locationId]
						const protocol = ctx.config.protocols[x.protocolId]

						return {
							text: `${location?.name} / ${protocol}`,
							callback_data: subscriptionShowData.pack({ id: x.id }),
						}
					})
				),
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

			const text = [
				`Локация:  ${ctx.config.locations[subscription.locationId]?.name}`,
				`Дата истечения: ${formatDate(subscription.endDate, 'long')}`,
				`Протокол: ${ctx.config.protocols[subscription.protocolId]}`,
			]

			await ctx.editText(
				format`📋 ${bold`Подробности подписки - ${subscription.remnawaveShortId ?? ''}`}\n\n ${join(text, (x) => bold`${x}`, '\n')}
		\n${bold`Ссылка подключения: ${code`${subscription.subUrl ?? ''}`}`}`,
				{
					reply_markup: new InlineKeyboard()
						.text('✅  ', 'profile')
						.text('Назад', 'my_subscriptions'),
				}
			)
		})
}
