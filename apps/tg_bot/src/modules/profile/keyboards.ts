import { InlineKeyboard } from 'gramio'

import { backKeyboard } from '@/shared/keyboards'

export const profileKeyboard = new InlineKeyboard()
	.text('📱Мои подписки', 'my-subscriptions')
	.row()
	.text('💸Пополнить баланс', 'topup-balance')
	.row()
	.combine(backKeyboard)
