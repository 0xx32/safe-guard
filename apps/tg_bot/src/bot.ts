import { autoload } from '@gramio/autoload'
import { scenes } from '@gramio/scenes'
import { session } from '@gramio/session'
import { getConfig } from '@repo/db/helpers'
import { Bot } from 'gramio'

import { config } from './config'
import { db } from './db/client'
import { topupBalanceScene } from './scenes'
import { storage } from './services/redis'
import { initialUserSession } from './sessions'

export const bot = new Bot(config.BOT_TOKEN)
	.derive(['message', 'callback_query'], async () => {
		const config = await getConfig('main', db)

		if (!config) throw new Error('Config not found')

		return { config }
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
		const config = await getConfig('main', db)

		if (!config) throw new Error('Config not found')

		// eslint-disable-next-line
		console.log(`✨ Bot ${info.username} was started!`)
	})

export type BotType = typeof bot
