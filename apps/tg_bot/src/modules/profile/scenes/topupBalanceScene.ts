import { Scene } from '@gramio/scenes'
import { InlineKeyboard } from 'gramio'

export const topupBalanceScene = new Scene('topupBalanceScene').step(
	['message', 'callback_query'],
	(ctx) => {
		if (ctx.scene.step.firstTime) {
			return ctx.editText('Введите сумму или выберите готовую.', {
				reply_markup: new InlineKeyboard()
					.text('💵100 000', '100000')
					.text('💵500 000', '500000')
					.text('💵1 000 000', '1000000'),
			})
		}

		if (ctx.is('callback_query')) {
			return ctx.scene.update({
				amount: ctx.queryPayload as number,
			})
		}
		if (!ctx.is('message')) return

		if (ctx.text === '' || Number.isNaN(Number.parseFloat(ctx.text ?? ''))) {
			return ctx.send('Сумма должна быть числом')
		}

		return ctx.scene.update({
			amount: ctx.text,
		})
	}
)
