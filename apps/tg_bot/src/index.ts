import process from 'node:process'

import { AppService } from './services/app.service.ts'
import { remnawave } from './services/remnawave.service.ts'
import { loggerInitializer } from './utils/loger.ts'

const signals = ['SIGINT', 'SIGTERM']

const appService = new AppService(remnawave)

async function main() {
	for (const signal of signals) {
		process.on(signal, async () => {
			await appService.stop()
			process.exit(0)
		})
	}

	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:', error)
	})

	process.on('unhandledRejection', (error) => {
		console.error('Unhandled rejection:', error)
	})

	await appService.start()
}

loggerInitializer()
main()
