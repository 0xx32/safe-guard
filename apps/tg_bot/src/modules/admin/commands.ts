import { InlineKeyboard } from 'gramio'

import type { BotType } from '@/bot'

export default (bot: BotType) => {
	bot.command('admin', async (ctx) => {
		await ctx.send('Админ меню', {
			reply_markup: new InlineKeyboard()
				.columns(1)
				.text('Настройки конфигурации', 'config-settings'),
		})
	})
}
