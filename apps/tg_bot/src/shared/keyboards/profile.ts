import { InlineKeyboard } from 'gramio'

export const profileMainKeyboard = new InlineKeyboard()
	.text('📱Мои подписки', 'my_subscriptions')
	.row()
	.text('💸Пополнить баланс', 'topup_balance')
	.row()
	.text('🔙Назад', 'main')
