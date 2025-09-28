import { InlineKeyboard } from 'gramio'

export const mainAdminKeyboard = () => {
	return new InlineKeyboard().text('Remnawave', 'show_remnawave_panel')
}
