import type { BotType } from '@/bot'

import { mainKeyboard } from '@/shared/keyboards'
import { startMessage } from '@/shared/messages/main'

export default (bot: BotType) => {
	bot.command('start', async (ctx) => {
		return ctx.send(startMessage(ctx.config.shopName), {
			reply_markup: mainKeyboard,
		})
	})
}
