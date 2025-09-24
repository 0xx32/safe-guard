import type { InternalSquad } from '@repo/remnawave'

import { getLogger } from '@logtape/logtape'
import { internalSquadsTable } from '@repo/db/schemes'

import { db } from '@/db/client'

const logger = getLogger(['db', 'bot'])

export class RemnawavePanelService {
	constructor() {}

	async updateInternalSquads(squads: InternalSquad[]) {
		for (const squad of squads) {
			const locationCode = squad.name.split('_')[1]
			if (!locationCode) throw new Error('Invalid squad name: Не указан код локации')

			const squadData = {
				uuid: squad.uuid,
				name: squad.name,
				membersCount: squad.info.membersCount,
				locationCode,
			}

			try {
				await db.insert(internalSquadsTable).values(squadData).onConflictDoUpdate({
					target: internalSquadsTable.uuid,
					set: squadData,
				})

				logger.info`Список InternalSquads обновлен`
			} catch (error) {
				logger.error`Ошибка при обновлении списка InternalSquads: ${error}`
			}
		}
	}
}

export const remnawavePanelService = new RemnawavePanelService()
