import { Scene } from '@gramio/scenes'
import { InlineKeyboard } from 'gramio'

import { getConfig } from '@/db/helpers'

interface TopupBalanceSceneParams {
	amount?: number
}

export const topupBalanceScene = new Scene('topupBalanceScene')
	.params<TopupBalanceSceneParams>()
	.step(['message', 'callback_query'], async (ctx) => {
		if (ctx.scene.params?.amount) return ctx.scene.update({ amount: ctx.scene.params.amount })

		const amounts = [100, 200, 500, 1000]

		if (ctx.scene.step.firstTime) {
			return ctx.editText('Введите сумму или выберите готову.', {
				reply_markup: new InlineKeyboard()
					.columns(2)
					.add(...amounts.map((x) => InlineKeyboard.text(`💵 ${x}`, x.toString()))),
			})
		}

		if (ctx.is('callback_query')) {
			await ctx.answerCallbackQuery()
			return ctx.scene.update({
				amount: ctx.queryPayload as number,
			})
		}

		if (ctx.text === '' || Number.isNaN(Number.parseFloat(ctx.text ?? ''))) {
			return ctx.send('Сумма должна быть числом')
		}

		return ctx.scene.update({
			amount: ctx.text,
		})
	})
	.step(['message', 'callback_query'], async (ctx) => {
		const config = await getConfig('main')

		if (!config?.paymentMethods || config.paymentMethods.every((x) => !x.enabled)) {
			await ctx.send('Методы оплаты не найдены', {
				reply_markup: new InlineKeyboard().text('Вернуться в главное меню', 'main'),
			})
			return ctx.scene.exit()
		}

		await ctx.scene.exit()

		const filteredPaymentMethods = config.paymentMethods.filter((x) => x.enabled)
		const keyboard = new InlineKeyboard()
			.combine(
				new InlineKeyboard()
					.columns(2)
					.add(
						...filteredPaymentMethods.map((x) =>
							InlineKeyboard.text(x.name, `create_payment:${x.key}:${ctx.scene.state.amount}`)
						)
					)
			)
			.row()
			.text('Назад', 'profile')

		if (ctx.is('callback_query')) {
			await ctx.answerCallbackQuery()

			return ctx.editText('Выберите способ оплаты', {
				reply_markup: keyboard,
			})
		}

		await ctx.scene.exit()

		return ctx.send('Выберите способ оплаты', {
			reply_markup: keyboard,
		})
	})
