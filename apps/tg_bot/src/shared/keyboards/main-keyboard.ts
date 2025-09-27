import type { User } from '@repo/db/schemes'

import { InlineKeyboard } from 'gramio'

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
