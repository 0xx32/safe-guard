import process from 'node:process'

import { bot } from './bot.ts'
import { AppService } from './services/app.service.ts'
import { remnawave } from './services/remnawave.service.ts'
import { loggerInitializer } from './utils/loger.ts'

const signals = ['SIGINT', 'SIGTERM']

const appService = new AppService(remnawave)

async function main() {
	for (const signal of signals) {
		process.on(signal, async () => {
			await bot.stop()
			process.exit(0)
		})
	}

	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:', error)
	})

	process.on('unhandledRejection', (error) => {
		console.error('Unhandled rejection:', error)
	})

	const remnawavePanelSync = await appService.syncRemnawavePanel()

	if (!remnawavePanelSync.status) {
		await bot.stop()
		process.exit(0)
	}

	await bot.start()
}

loggerInitializer()
main()
