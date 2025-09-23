import type { BotType } from '@/bot'

import { backKeyboard, mainKeyboard } from '@/shared/keyboards'
import { RULLES_MESSAGE, START_MESSAGE } from '@/utils/constants/messages'

export default (bot: BotType) => {
	bot.callbackQuery('rules', (ctx) => {
		ctx.answerCallbackQuery()
		ctx.editText(RULLES_MESSAGE, {
			reply_markup: backKeyboard,
		})
	})
	bot.callbackQuery('main', (ctx) => {
		ctx.answerCallbackQuery()
		ctx.editText(START_MESSAGE, {
			reply_markup: mainKeyboard,
		})
	})
}
