import { bold, code, format } from 'gramio'

import type { BotType } from '@/bot'

import { topupBalanceScene } from '@/scenes'
import { getUserByTelegramId } from '@/utils/helpers/databaseQueries'

import { profileKeyboard } from './keyboards'

export default (bot: BotType) => {
	bot
		.callbackQuery('profile', async (ctx) => {
			ctx.answerCallbackQuery()

			const user = await getUserByTelegramId(ctx.from.id)

			if (!user) {
				return ctx.send('Профиль не найден')
			}

			const uniqueID = user.uuid ?? 'не установлен'

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
