import type { User } from '@repo/db/schemes'

import { InlineKeyboard } from 'gramio'

import { config } from '@/config'

export const mainKeyboard = (user: User) => {
	const isTrial = !user.hasHadPaidSubscription && !user.isUsedTrial

	return new InlineKeyboard()
		.addIf(isTrial, { text: '🎁Пробная подписка', callback_data: 'trial_subscription' })
		.row()
		.text('🔒Купить VPN', 'buy_subscription')
		.text('💵Профиль', 'profile')
		.row()
		.text('📔Правила использования', 'rules')
}

export const backKeyboard = new InlineKeyboard().text('🔙Назад', 'main')
export const errorKeyboard = new InlineKeyboard()
	.url('Поддержка', config.SUPPORT_URL)
	.row()
	.text('Вернуться в главное меню', 'main')
