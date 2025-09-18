import { InlineKeyboard } from 'gramio'

import { backKeyboard } from '@/shared/keyboards'

import { profileCallbackData } from './callback-data'

export const profileKeyboard = new InlineKeyboard()
	.text('📱Мои подписки', profileCallbackData.mySubscriptions)
	.row()
	.text('💸Пополнить баланс', profileCallbackData.topupBalance)
	.row()
	.combine(backKeyboard)
