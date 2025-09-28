import type { BotType } from '@/bot'

import { mainAdminKeyboard } from '@/shared/keyboards/admin/main'

export default (bot: BotType) => {
	bot.callbackQuery('show_admin_panel', async (ctx) => {
		return ctx.editText('Админка', {
			reply_markup: mainAdminKeyboard(),
		})
	})
}
