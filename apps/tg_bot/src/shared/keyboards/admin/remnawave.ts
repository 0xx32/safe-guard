import { InlineKeyboard } from 'gramio'

export const remnawavePanelKeyboard = () => {
	return new InlineKeyboard().text('Синхронизация с Remnawave', 'sync_remnawave')
}
