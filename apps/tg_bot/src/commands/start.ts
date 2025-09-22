import { usersTable } from '@repo/db/schemes'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { mainKeyboard } from '@/shared/keyboards'
import { START_MESSAGE } from '@/utils/constants/messages'
import { getUserByTelegramId } from '@/utils/helpers/databaseQueries'

export default (bot: BotType) => {
	bot.command('start', async (ctx) => {
		await ctx.send(START_MESSAGE, {
			reply_markup: mainKeyboard,
		})

		const user = await getUserByTelegramId(ctx.from.id)

		if (!user) {
			await db.insert(usersTable).values({
				telegramId: ctx.from.id.toString(),
				telegramUsername: ctx.from.username,
				uuid: crypto.randomUUID(),
			})
		}
	})
}
