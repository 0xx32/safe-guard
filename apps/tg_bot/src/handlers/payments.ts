import type { FormattableString } from 'gramio'

import { paymentsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, CallbackData, code, format, InlineKeyboard } from 'gramio'

import type { BotType } from '@/bot'

import { db } from '@/db/client'
import { getPaymentById } from '@/db/helpers'
import { paymentService } from '@/services/payment.service'
import { backKeyboard } from '@/shared/keyboards'

export const topupBalanceLolzData = new CallbackData('topup_balance:lolz').number('amount')
const checkPaymentData = new CallbackData('check_payment').number('paymentId')
const paymentCancelData = new CallbackData('payment_cancel').number('paymentId')

export default async (bot: BotType) => {
	bot
		.callbackQuery(/create_payment:(.*)/, async (ctx) => {
			const match = ctx.queryData
			const [paymentMethod, amount]: string[] = match[1]!.split(':')

			if (!amount || Number.isNaN(+amount) || !paymentMethod) {
				return ctx.editText('Ошибка оплаты', {
					reply_markup: backKeyboard,
				})
			}

			const paymentData = {
				id: 0,
				url: '',
				amount: 0,
			}

			let message: FormattableString = format``

			if (paymentMethod === 'lolz') {
				const payment = await paymentService.createLztPayPayment(
					ctx.user.id,
					+amount,
					`Пополнение баланса пользователя id: ${ctx.user.id}`
				)

				if (!payment) {
					return ctx.editText('Ошибка создания платежа', {
						reply_markup: backKeyboard,
					})
				}

				paymentData.id = +payment.payment_id
				paymentData.url = payment.url
				paymentData.amount = payment.amount

				message = format`Платеж: ${code(paymentData.id)}
				Способ оплаты: ${bold`Lolz Market`}
				Сумма: ${bold(paymentData.amount)} ₽`
			}

			if (paymentMethod === 'cryptobot') {
				const payment = await paymentService.createCryptobotPayment({
					userId: ctx.user.id,
					amount: +amount,
					description: `Пополнение баланса пользователя id: ${ctx.user.id}`,
					currencyType: 'fiat',
					fiat: 'RUB',
					paid_btn_name: 'Вернуться в магазин',
					paid_btn_url: 'https://t.me/madnes_vpn_bot',
				})

				if (!payment) {
					return ctx.editText('Ошибка создания платежа', {
						reply_markup: backKeyboard,
					})
				}

				paymentData.id = payment.id
				paymentData.url = payment.url
				paymentData.amount = +payment.amount

				message = format`Платеж: ${code(paymentData.id)}
				Способ оплаты: ${bold`CryptoBot`}
				Сумма: ${bold(paymentData.amount)} ₽`
			}

			return ctx.editText(message, {
				reply_markup: new InlineKeyboard()
					.url('Оплатить', paymentData.url)
					.text('Проверить', checkPaymentData.pack({ paymentId: paymentData.id }))
					.row()
					.url('Поддержка', 'https://t.me/safeguard_ru')
					.row()
					.text('Отмена', paymentCancelData.pack({ paymentId: paymentData.id })),
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
