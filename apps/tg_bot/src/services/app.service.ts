import { getLogger } from '@logtape/logtape'
import { DrizzleError, sql } from 'drizzle-orm'
import process from 'node:process'

import { bot } from '@/bot'
import { client, db } from '@/db/client'

import { remnawave } from '../utils/remnawave'
import { remnawavePanelService } from './remnawavePanel.service'

const logger = getLogger(['app', 'db'])

export class AppService {
	constructor() {}

	async start() {
		const isDBConnection = await this.checkDBConnection()
		const remnawavePanelSync = await this.syncRemnawavePanel()

		if (!isDBConnection || !remnawavePanelSync.status) {
			return process.exit(0)
		}

		await bot.start()
	}

	async stop() {
		await bot.stop()
	}

	private async syncRemnawavePanel() {
		try {
			const internalSquadsPromise = remnawave.getAllInternalSquads()

			const [internalSquads] = await Promise.all([internalSquadsPromise])

			if (internalSquads.status === 'success') {
				remnawavePanelService.updateInternalSquads(internalSquads.data.internalSquads)
			} else {
				throw new Error('Remnawave error')
			}

			return {
				status: true,
			}
		} catch (error) {
			if (error instanceof DrizzleError) {
				throw new Error(error.message)
			}

			if (error instanceof Error) {
				throw new Error(error.message)
			}
			throw new Error('Unknown error')
		}
	}

	private async checkDBConnection() {
		try {
			await db.execute(sql`SELECT 1`)
			logger.info`Соединение с БД установлено`

			return true
		} catch (error) {
			client.end()

			logger.info`Ошибка подключения к БД: ${error}`
			return false
		}
	}
}
