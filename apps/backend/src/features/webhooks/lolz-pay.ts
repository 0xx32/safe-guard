import { getUserById } from '@repo/db/helpers'
import { paymentsTable, usersTable } from '@repo/db/schemes'
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
		.update(paymentsTable)
		.set({
			amount: invoice.amount,
			comment: invoice.comment,
			date: new Date(invoice.invoice_date),
			externalId: invoice.invoice_id.toString(),
			status: 'paid',
			method: 'lolz',
			updated_at: new Date(Date.now()),
		})
		.where(eq(paymentsTable.id, +invoice.payment_id))
		.returning()

	const user = await getUserById(userId, db)

	if (!user) {
		return c.json(
			{
				status: false,
				message: 'Не удалось получить пользователя',
			},
			404
		)
	}

	await db.update(usersTable).set({
		balance: user.balance + invoice.amount,
	})


	console.log('@Платеж успешен', invoice)
	

	return c.json({ status: true, message: 'Платеж успешно оплачен' }, 200)
})
