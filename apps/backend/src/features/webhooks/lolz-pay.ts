import { payments, users } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import type { Invoice } from '@/types/lolz-pay'

import { config } from '@/config'
import { db } from '@/db/client'

export const lolzPay = new Hono()

lolzPay.post('/webhook', async (c) => {
	const secretKey = c.req.header('x-secret-key')

	if (secretKey !== config.LOLZ_MERCHANT_API_KEY) {
		return c.json(
			{
				status: false,
				message: 'Не верный ключ магазина',
			},
			401
		)
	}

	const invoice = await c.req.json<Invoice>()

	console.log('@Invoice', invoice)

	const { userId } = JSON.parse(invoice.additional_data) as {
		userId: number
	}

	if (!userId) {
		return c.json(
			{
				status: false,
				message: 'Не удалось получить id пользователя из additional_data',
			},
			401
		)
	}

	await db
		.update(payments)
		.set({
			amount: invoice.amount,
			comment: invoice.comment,
			date: invoice.invoice_date,
			paymentSystemId: invoice.invoice_id.toString(),
			status: 'paid',
			system: 'lolz',
			updated_at: new Date(),
		})
		.where(eq(payments.id, +invoice.payment_id))
		.returning()

	const usersBalance = await db
		.select({ balance: users.balance })
		.from(users)
		.where(eq(users.id, userId))
	const user = usersBalance.at(0)

	if (!user) {
		return c.json(
			{
				status: false,
				message: 'Не удалось получить пользователя',
			},
			404
		)
	}

	await db.update(users).set({
		balance: user.balance + invoice.amount,
	})

	return c.json({ status: true, message: 'Платеж успешно оплачен' }, 200)
})
