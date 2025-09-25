import { paymentsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, CallbackData, code, format, InlineKeyboard } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { getPaymentById } from '@/db/helpers'
import { getUserByTelegramId } from '@/db/helpers/user'
import { paymentService } from '@/services/payment.service'
import { backKeyboard } from '@/shared/keyboards'

export const topupBalanceLolzData = new CallbackData('topup_balance:lolz').number('amount')
const checkPaymentData = new CallbackData('check_payment').number('paymentId')
const paymentCancelData = new CallbackData('payment_cancel').number('paymentId')

export default async (bot: BotType) => {
	bot
		.callbackQuery(topupBalanceLolzData, async (ctx) => {
			const queryData = ctx.queryPayload as string

			const paymentMethod = queryData.split(':').at(1)

			if (!paymentMethod) {
				return ctx.editText('Ошибка при выборе оплаты', {
					reply_markup: backKeyboard,
				})
			}

			const user = await getUserByTelegramId(ctx.from.id)

			if (!user) {
				return ctx.send('Вы не авторизованы', {
					reply_markup: backKeyboard,
				})
			}

			const payment = await paymentService.createLztPayPayment(user.id, ctx.queryData.amount)

			if (!payment) {
				return ctx.editText('Ошибка создания платежа', {
					reply_markup: backKeyboard,
				})
			}

			const message = format`Платеж: ${code(payment.id)}
				Способ оплаты: ${bold`Lolz Market`}
				Сумма: ${bold(ctx.queryData.amount)} ₽`

			return ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.url('Оплатить', payment.url)
					.text('Проверить', checkPaymentData.pack({ paymentId: payment.id }))
					.row()
					.url('Поддержка', 'https://t.me/safeguard_ru')
					.row()
					.text('Отмена', paymentCancelData.pack({ paymentId: payment.id })),
			})
		})
		.callbackQuery(checkPaymentData, async (ctx) => {
			const paymentsList = await db
				.select()
				.from(paymentsTable)
				.where(eq(paymentsTable.id, ctx.queryData.paymentId))

			const payment = paymentsList.at(0)

			if (!payment) {
				return ctx.editText('Платеж не существует', {
					reply_markup: backKeyboard,
				})
			}

			if (payment.status === 'not_paid') {
				return ctx.answerCallbackQuery('Не оплачен')
			}

			await ctx.answerCallbackQuery('Оплачен')

			await ctx.editText(`Баланс успешно пополнен на ${payment.amount} ₽`, {
				reply_markup: new InlineKeyboard()
					.addIf(ctx.session.isWaitingForPayment, {
						text: 'Вернуться к оформлению заказа',
						callback_data: 'back_to_checkout',
					})
					.row()
					.text('Главное меню', 'main'),
			})

			ctx.session.isWaitingForPayment = false
		})
		.callbackQuery(paymentCancelData, async (ctx) => {
			const payment = await getPaymentById(ctx.queryData.paymentId)

			if (!payment) {
				await ctx.answerCallbackQuery('Платеж не найден')
				return ctx.editText('Платеж не найден', {
					reply_markup: backKeyboard,
				})
			}

			if (payment.status === 'paid') {
				return ctx.editText('Вы не можете отменить оплату, которая уже оплачена', {
					reply_markup: backKeyboard,
				})
			}

			await db
				.update(paymentsTable)
				.set({
					status: 'canceled',
				})
				.where(eq(paymentsTable.id, ctx.queryData.paymentId))

			await ctx.answerCallbackQuery('Оплата успешно отменена')
			return ctx.editText('Платеж отменен', {
				reply_markup: backKeyboard,
			})
		})
}
