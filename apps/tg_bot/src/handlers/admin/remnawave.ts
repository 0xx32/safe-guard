import type { BotType } from '@/bot'

import { remnawavePanelService } from '@/services/remnawavePanel.service'
import { remnawavePanelKeyboard } from '@/shared/keyboards/admin/remnawave'
import { remnawavePanelSyncResultMessage } from '@/shared/messages/remnawave'

export default (bot: BotType) => {
	bot
		.callbackQuery('show_remnawave_panel', async (ctx) => {
			return ctx.editText('REMNAWAVE panel', {
				reply_markup: remnawavePanelKeyboard(),
			})
		})
		.callbackQuery('sync_remnawave', async (ctx) => {
			const syncResult = await remnawavePanelService.sync()

			return ctx.editText(remnawavePanelSyncResultMessage(syncResult), {
				reply_markup: remnawavePanelKeyboard(),
			})
		})
}
