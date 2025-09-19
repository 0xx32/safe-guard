import * as schemes from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import type { BotType } from '@/bot'

import { config } from '@/config'
import { db } from '@/db/client'
import { LztPay } from '@/services/lolz-pay/client'
import { mainKeyboard } from '@/shared/keyboards'
import { START_MESSAGE } from '@/utils/constants/messages'

export default (bot: BotType) => {
	bot
		.command('start', async (ctx) => {
			await ctx.send(START_MESSAGE, {
				reply_markup: mainKeyboard,
			})

			const user = await db
				.select()
				.from(schemes.users)
				.where(eq(schemes.users.telegramID, ctx.from.id.toString()))

			if (!user.at(0)) {
				await db.insert(schemes.users).values({
					telegramID: ctx.from.id.toString(),
					tgUserName: ctx.from.username,
					uniqueID: crypto.randomUUID(),
				})
			}
		})
		.command('addConfig', async (ctx) => {
			await db.insert(schemes.configTable).values({
				key: 'subscription',
				values: {
					periods: [
						{
							label: '1 месяц',
							key: '1m',
							price: 59,
							enabled: true,
						},
						{
							label: '2 месяца',
							key: '2m',
							price: 100,
							enabled: true,
						},
						{
							label: '3 месяца',
							key: '3m',
							price: 120,
							enabled: true,
						},
					],
				},
			})

			return ctx.send('Конфиг добавлен')
		})
		.command('test', async (ctx) => {
			const lolzAPi = new LztPay()

			const userOptions = {
				paymentMethod: 'lolz',
				userId: 1,
				amount: 1,
				comment: 'Test',
			}

			const paymentList = await db
				.insert(schemes.payments)
				.values({
					system: 'lolz',
					userId: userOptions.userId,
					amount: userOptions.amount,
					status: 'not_paid',
					paymentSystemId: JSON.stringify({
						userId: userOptions.userId,
					}),
				})
				.returning()

			const payment = paymentList.at(0)

			if (!payment) {
				return ctx.send('Ошибка создания платежа')
			}

			const invoiceResponse = await lolzAPi.createInvoice({
				params: {
					amount: userOptions.amount,
					currency: 'RUB',
					payment_id: payment.id.toString(),
					comment: userOptions.comment,
					url_success: 'https://google.com',
					url_callback: config.LOLZ_CALLBACK_URL,
					merchant_id: +config.LOLZ_MERCHANT_ID,
					is_test: false,
				},
			})

			if (!invoiceResponse.data) {
				return ctx.send('Ошибка создания платежа в Лозз')
			}

			const { invoice } = invoiceResponse.data

			await db
				.update(schemes.payments)
				.set({
					paymentSystemId: invoice.invoice_id.toString(),
				})
				.where(eq(schemes.payments.id, +invoice.payment_id))
		})
}
