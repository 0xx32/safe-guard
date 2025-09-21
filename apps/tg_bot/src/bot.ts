import { autoload } from '@gramio/autoload'
import { scenes } from '@gramio/scenes'
import { session } from '@gramio/session'
import { Bot } from 'gramio'

import { adminScenes } from '@/modules/admin'
import { buyScene } from '@/modules/buy'
import { profileScenes } from '@/modules/profile'

import { config } from './config'
import { storage } from './services/redis'
import { initialUserSession } from './sessions'


export const bot = new Bot(config.BOT_TOKEN)
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
	.extend(scenes([...profileScenes, buyScene, ...adminScenes]))
	.onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`))

export type BotType = typeof bot
