import type { BotType } from '@/bot'

import { callbackData } from '@/shared/callback-data'
import { backKeyboard, mainKeyboard } from '@/shared/keyboards'
import { RULLES_MESSAGE, START_MESSAGE } from '@/utils/constants/messages'

export default (bot: BotType) => {
	bot.callbackQuery(callbackData.rules, (ctx) => {
		ctx.answerCallbackQuery()
		ctx.editText(RULLES_MESSAGE, {
			reply_markup: backKeyboard,
		})
	})
	bot.callbackQuery(callbackData.back, (ctx) => {
		ctx.answerCallbackQuery()
		ctx.editText(START_MESSAGE, {
			reply_markup: mainKeyboard,
		})
	})
}
