import { autoload } from '@gramio/autoload'
import { scenes } from '@gramio/scenes'
import { session } from '@gramio/session'
import { getLogger } from '@logtape/logtape'
import { Bot } from 'gramio'

import { config } from './config'
import { createDefaultConfig, getConfig } from './db/helpers'
import { topupBalanceScene } from './scenes'
import { storage } from './services/redis'
import { findOrRegisterUser } from './shared/functions/findOrRegisterUser'
import { initialUserSession } from './utils/sessions'

const logger = getLogger(['bot'])

export const bot = new Bot(config.BOT_TOKEN)
	.derive(['message', 'callback_query'], async (ctx) => {
		const config = await getConfig('main')

		const user = await findOrRegisterUser({
			telegramId: ctx.from.id,
			telegramUsername: ctx.from.username,
			firstName: ctx.from.firstName,
			lastName: ctx.from.lastName,
		})

		if (!config) throw new Error('Config not found')

		return { config, user, login: () => ctx.send('Авторизоваться') }
	})
	.extend(
		session({
			key: 'session',
			initial: () => initialUserSession(),
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
	.extend(scenes([topupBalanceScene]))
	.onStart(async ({ info }) => {
		const config = await getConfig('main')

		if (!config) {
			await createDefaultConfig('main')
		}

		logger.info`Bot ${info.username} was started!`

		// console.log(`✨ Bot ${info.username} was started!`)
	})

export type BotType = typeof bot
