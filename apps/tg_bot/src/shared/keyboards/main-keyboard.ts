import { InlineKeyboard } from 'gramio'

export const mainKeyboard = new InlineKeyboard()
	.text('🔒Купить VPN', 'buy')
	.text('💵Профиль', 'profile')
	.row()
	.text('📔Правила использования', 'rules')

export const backKeyboard = new InlineKeyboard().text('🔙Назад', 'back')
