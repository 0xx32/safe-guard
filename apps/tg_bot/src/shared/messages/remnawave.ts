import { bold, format } from 'gramio'

export const remnawavePanelSyncResultMessage = (
	statuses: Record<string, boolean>
) => format`${bold`Результаты синхронизации с Remnawave:\n`}
${bold`Internal Squads:`} - ${statuses.internalSquads ? '✅' : '❌'}`
