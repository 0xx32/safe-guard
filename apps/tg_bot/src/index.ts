import process from 'node:process'

import { bot } from './bot.ts'

const signals = ['SIGINT', 'SIGTERM']

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

	await bot.start()
}

main()
