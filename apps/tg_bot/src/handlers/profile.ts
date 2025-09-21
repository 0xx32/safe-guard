import type { BotType } from '@/bot'

import { topupBalanceScene } from '@/scenes'
import { topupBalanceData } from '@/shared/callbackData/profile'

export default (bot: BotType) => {
	bot.callbackQuery(topupBalanceData, async (ctx) => {
		await ctx.answerCallbackQuery()
		return ctx.scene.enter(topupBalanceScene, {
			amount: ctx.queryData.amount,
		})
	})
}
