import { usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { mainKeyboard } from '@/shared/keyboards'
import { START_MESSAGE } from '@/utils/constants/messages'

export default (bot: BotType) => {
	bot.command('start', async (ctx) => {
		await ctx.send(START_MESSAGE, {
			reply_markup: mainKeyboard,
		})

		const user = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.telegramId, ctx.from.id.toString()))

		if (!user.at(0)) {
			await db.insert(usersTable).values({
				telegramId: ctx.from.id.toString(),
				telegramUsername: ctx.from.username,
				uuid: crypto.randomUUID(),
			})
		}
	})
}
