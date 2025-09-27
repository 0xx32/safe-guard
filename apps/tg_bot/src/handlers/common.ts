import type { BotType } from '@/bot'

import { backKeyboard, mainKeyboard } from '@/shared/keyboards'
import { RULLES_MESSAGE, startMessage } from '@/shared/messages/main'

export default (bot: BotType) => {
	bot.callbackQuery('rules', (ctx) => {
		ctx.answerCallbackQuery()
		ctx.editText(RULLES_MESSAGE, {
			reply_markup: backKeyboard,
		})
	})
	bot.callbackQuery('main', (ctx) => {
		ctx.answerCallbackQuery()
		ctx.editText(startMessage(ctx.config.shopName), {
			reply_markup: mainKeyboard(ctx.user),
		})
	})
}
