import { paymentsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, CallbackData, code, format, InlineKeyboard, join } from 'gramio'

import type { BotType } from '@/bot'

import { config } from '@/config'
import { db } from '@/db/client'
import { getPaymentById } from '@/db/helpers'
import { getUserByTelegramId } from '@/db/helpers/user'
import { LztPay } from '@/services/lolz-pay'
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

			const newPaymentsReturning = await db
				.insert(paymentsTable)
				.values({
					userId: user.id,
					method: 'lolz',
					amount: ctx.queryData.amount,
					comment: `Пополнение баланса пользователя id: ${user.id}`,
				})
				.returning()

			const newPayment = newPaymentsReturning.at(0)

			if (!newPayment) {
				return ctx.editText('Ошибка создания платежа', {
					reply_markup: backKeyboard,
				})
			}

			const lolzAPi = new LztPay()

			try {
				const invoiceResponse = await lolzAPi.createInvoice({
					params: {
						amount: ctx.queryData.amount,
						comment: `Пополнение баланса пользователя id: ${user.id}`,
						url_success: 'https://google.com',
						url_callback: config.LOLZ_CALLBACK_URL,
						merchant_id: +config.LOLZ_MERCHANT_ID,
						is_test: true,
						currency: 'RUB',
						payment_id: newPayment.id.toString(),
						additional_data: JSON.stringify({
							userId: user.id,
						}),
					},
				})

				if (!invoiceResponse) {
					return ctx.editText('Ошибка создания платежа', {
						reply_markup: backKeyboard,
					})
				}

				const text = [
					`Платеж: ${format`${code`${newPayment.id}`}`}`,
					`Способ оплаты: Lolz Market`,
					`Сумма: ${ctx.queryData.amount} ₽`,
				]

				await ctx.editText(format`${join(text, (x) => bold`${x}`, '\n')}`, {
					reply_markup: new InlineKeyboard()
						.url('Оплатить', invoiceResponse.data.invoice.url)
						.text('Проверить', checkPaymentData.pack({ paymentId: newPayment.id }))
						.row()
						.url('Поддержка', 'https://t.me/safeguard_ru')
						.row()
						.text('Отмена', paymentCancelData.pack({ paymentId: newPayment.id })),
				})
			} catch (error) {
				console.error(error)
				return ctx.editText('Ошибка создания платежа', {
					reply_markup: backKeyboard,
				})
			}
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

			return ctx.editText(`Баланс успешно пополнен на ${payment.amount} ₽`, {
				reply_markup: backKeyboard,
			})
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
