import type { BotType } from '@/bot'

import { mainKeyboard } from '@/shared/keyboards'
import { mainAdminKeyboard } from '@/shared/keyboards/admin/main'
import { startMessage } from '@/shared/messages/main'

export default (bot: BotType) => {
	bot
		.command('start', async (ctx) => {
			return ctx.send(startMessage(ctx.config.shopName), {
				reply_markup: mainKeyboard(ctx.user),
			})
		})
		.command('admin', async (ctx) => {
			return ctx.send('Админка', {
				reply_markup: mainAdminKeyboard(),
			})
		})
}
