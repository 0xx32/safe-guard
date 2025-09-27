import type { InternalSquad } from '@repo/remnawave'

import { getLogger } from '@logtape/logtape'
import { squadsTable } from '@repo/db/schemes'

import { db } from '@/db/client'
import { remnawave } from '@/utils/remnawave'

const logger = getLogger(['app', 'db'])

export class RemnawavePanelService {
	constructor() {}

	async updateInternalSquads(squads: InternalSquad[]) {
		try {
			for (const squad of squads) {
				const res = await remnawave.getInternalSquadAccessibleNodes(squad.uuid)

				if (res.status === 'error') {
					logger.error`Ошибка при получении доступных узлов для InternalSquad: ${res.error}`
					continue
				}

				const countryCodes = res.data.accessibleNodes.map((node) => node.countryCode)

				const squadData = {
					uuid: squad.uuid,
					name: squad.name,
					membersCount: squad.info.membersCount,
					countryCodes,
				}

				await db.insert(squadsTable).values(squadData).onConflictDoUpdate({
					target: squadsTable.uuid,
					set: squadData,
				})
			}

			logger.info`Список InternalSquads обновлен`
		} catch (error) {
			logger.error`Ошибка при обновлении списка InternalSquads: ${error}`
		}
	}
}

export const remnawavePanelService = new RemnawavePanelService()
