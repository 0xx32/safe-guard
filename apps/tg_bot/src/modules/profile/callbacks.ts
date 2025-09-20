import * as schemes from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, code, format } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'

import { profileKeyboard } from './keyboards'
import { topupBalanceScene } from './scenes'

export default (bot: BotType) => {
	bot
		.callbackQuery('profile', async (ctx) => {
			ctx.answerCallbackQuery()

			const user = (
				await db
					.select()
					.from(schemes.users)
					.where(eq(schemes.users.telegramID, ctx.from.id.toString()))
			).at(0)

			if (!user) {
				return ctx.send('Профиль не найден')
			}

			const uniqueID = user.uniqueID ?? 'не установлен'

			await ctx.editText(
				format`${bold`Профиль`}\n\nID: ${code`${uniqueID}`}\nБаланс: ${user.balance} RUB`,
				{
					reply_markup: profileKeyboard,
				}
			)
		})
		.callbackQuery('topup-balance', async (ctx) => {
			ctx.answerCallbackQuery()

			ctx.scene.enter(topupBalanceScene)
		})
}
