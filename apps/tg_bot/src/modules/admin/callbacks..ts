import type { BotType } from '@/bot'

import { configSettingsScene } from './scenes'

export default (bot: BotType) => {
	bot.callbackQuery('config-settings', async (ctx) => {
		return ctx.scene.enter(configSettingsScene)
	})
}
