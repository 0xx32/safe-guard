import { autoload } from '@gramio/autoload'
import { scenes } from '@gramio/scenes'
import { session } from '@gramio/session'
import { Bot } from 'gramio'

import { config } from './config'
import { createDefaultConfig, getConfig, getUserByTelegramId } from './db/helpers'
import { topupBalanceScene } from './scenes'
import { storage } from './services/redis'
import { initialUserSession } from './utils/sessions'

export const bot = new Bot(config.BOT_TOKEN)
	.derive(['message', 'callback_query'], async (ctx) => {
		const config = await getConfig('main')
		const user = await getUserByTelegramId(ctx.from.id)

		if (!config) throw new Error('Config not found')

		return { config, user, login: () => ctx.send('Авторизоваться') }
	})
	.extend(
		session({
			key: 'session',
			initial: initialUserSession,
			storage,
		})
	)
	.extend(
		autoload({
			path: './commands',
		})
	)
	.extend(
		autoload({
			path: './handlers',
		})
	)
	.extend(
		autoload({
			path: './modules',
			skipImportErrors: true,
		})
	)
	.extend(scenes([topupBalanceScene]))
	.onStart(async ({ info }) => {
		const config = await getConfig('main')

		if (!config) {
			await createDefaultConfig('main')
		}

		// eslint-disable-next-line
		console.log(`✨ Bot ${info.username} was started!`)
	})

export type BotType = typeof bot
