import type { Remnawave } from '@repo/remnawave'

import { DrizzleError } from 'drizzle-orm'

import { remnawavePanelService } from './remnawavePanel.service'

export class AppService {
	remnawave: Remnawave
	constructor(remnawave: Remnawave) {
		this.remnawave = remnawave
	}

	async syncRemnawavePanel() {
		try {
			const internalSquadsPromise = this.remnawave.getAllInternalSquads()

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
}
