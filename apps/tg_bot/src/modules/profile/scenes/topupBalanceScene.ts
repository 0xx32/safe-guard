import { Scene } from '@gramio/scenes'
import { getConfig } from '@repo/db/helpers'
import {
	payments as paymentsTable,
	paymentSystemsSchema,
	users,
} from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { InlineKeyboard } from 'gramio'

import { config } from '@/config'
import { db } from '@/db/client'

import { createInvoiceLolzPay } from '../helpers/createInvoice'

export const topupBalanceScene = new Scene('topupBalanceScene')
	.step(['message', 'callback_query'], async (ctx) => {
		if (ctx.scene.step.firstTime) {
			const config = await getConfig('main', db)

			if (!config) return ctx.send('Не удалось получить конфигурацию')

			return ctx.editText('Введите сумму или выберите готовую.', {
				reply_markup: new InlineKeyboard()
					.columns(2)
					.add(
						...config.subscriptions.map((x) =>
							InlineKeyboard.text(`💵${x.price}`, x.price.toString())
						)
					),
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
	})
	.step(['message', 'callback_query'], async (ctx) => {
		const config = await getConfig('main', db)

		if (!config) return ctx.send('Не удалось получить конфигурацию')

		const paymentMethodsKeyboard = new InlineKeyboard().add(
			...config.paymentMethods.map((x) =>
				InlineKeyboard.text(x.name, `${x.key}`)
			)
		)

		if (ctx.scene.step.firstTime && ctx.is('callback_query')) {
			return ctx.editText('Выберите способ оплаты', {
				reply_markup: paymentMethodsKeyboard,
			})
		}

		if (ctx.scene.step.firstTime && ctx.is('message')) {
			return ctx.send('Выберите способ оплаты', {
				reply_markup: paymentMethodsKeyboard,
			})
		}
		if (ctx.is('message')) return

		if (!config.paymentMethods.some((x) => x.key === ctx.queryPayload)) return

		await ctx.answerCallbackQuery()

		return ctx.scene.update({
			paymentMethod: {
				key: ctx.queryPayload as string,
				name: config.paymentMethods.find((x) => x.key === ctx.queryPayload)
					?.name,
			},
		})
	})
	.step('callback_query', async (ctx) => {
		if (ctx.queryPayload === 'cancel') {
			await ctx.scene.exit()

			return ctx.editText('Оплата отменена', {
				reply_markup: new InlineKeyboard().text('Назад', 'main'),
			})
		}

		const usersIds = await db
			.select({ userId: users.id })
			.from(users)
			.where(eq(users.telegramID, ctx.from.id.toString()))

		const userId = usersIds.at(0)?.userId

		if (!userId) {
			return ctx.send('Не удалось получить id пользователя')
		}

		const addedPayments = await db
			.insert(paymentsTable)
			.values({
				userId,
				system: paymentSystemsSchema.enum.lolz,
				amount: ctx.scene.state.amount,
			})
			.returning()

		const adddedPayment = addedPayments.at(0)

		if (!adddedPayment) {
			return ctx.send('Ошибка создания платежа')
		}

		const invoice = await createInvoiceLolzPay({
			amount: ctx.scene.state.amount,
			comment: `Пополнение баланса пользователя id: ${userId}`,
			url_success: 'https://google.com',
			url_callback: config.LOLZ_CALLBACK_URL,
			merchant_id: +config.LOLZ_MERCHANT_ID,
			is_test: true,
			currency: 'RUB',
			payment_id: adddedPayment.id.toString(),
			additional_data: JSON.stringify({
				userId,
			}),
		})
		if (!invoice) {
			return ctx.send('Ошибка создания платежа')
		}

		await ctx.editText(
			`Платеж ${adddedPayment.id}
				Способ оплаты: ${ctx.scene.state.paymentMethod.name}
				Сумма: ${ctx.scene.state.amount} ₽`,
			{
				reply_markup: new InlineKeyboard()
					.url('Оплатить', invoice.url)
					.text('Проверить', 'check')
					.row()
					.url('Поддержка', 'https://t.me/safeguard_ru')
					.text('Отмена', 'cancel'),
			}
		)
		return ctx.scene.update({
			paymentId: adddedPayment.id,
		})
	})
	.step('callback_query', async (ctx) => {
		if (ctx.queryPayload === 'cancel') {
			await ctx.scene.exit()

			return ctx.editText('Оплата отменена', {
				reply_markup: new InlineKeyboard().text('Назад', 'main'),
			})
		}

		if (ctx.queryPayload === 'check') {
			const paymentsList = await db
				.select()
				.from(paymentsTable)
				.where(eq(paymentsTable.id, ctx.scene.state.paymentId))
			const payment = paymentsList.at(0)

			if (!payment) {
				await ctx.editText('Ошибка получения данных о платеже', {
					reply_markup: new InlineKeyboard().text('Назад', 'main'),
				})
				return ctx.scene.exit()
			}

			if (payment.status === 'not_paid') {
				return ctx.answerCallbackQuery('Не оплачен')
			}

			await ctx.answerCallbackQuery('Оплачен')
			return ctx.scene.exit()
		}
	})
