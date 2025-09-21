import { usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import type { BotType } from '@/bot'

import { db } from '@/db/client'

import { buyScene } from './scenes'

export default (bot: BotType) => {
	bot.callbackQuery('buy', async (ctx) => {
		ctx.answerCallbackQuery()

		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.telegramId, ctx.from.id.toString()))

		const user = users.at(0)

		if (!user) {
			return ctx.send('Пользователь не найден')
		}

		return ctx.scene.enter(buyScene, { user })
	})
}
