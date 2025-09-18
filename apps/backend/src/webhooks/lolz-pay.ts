import { payments } from '@repo/db/schemes'
import { Hono } from 'hono'

import type { Invoice } from '@/types/lolz-pay'

import { config } from '@/config'
import { db } from '@/db/client'

export const lolzPay = new Hono()

lolzPay.post('/webhook', async (c) => {
	const secretKey = c.req.header('x-secret-key')

	if (secretKey !== config.LOLZ_MERCHANT_ID) {
		return c.json(
			{
				success: false,
				message: 'Invalid secret key',
			},
			401
		)
	}

	const invoice = await c.req.json<Invoice>()

	const additionalData = JSON.parse(invoice.additional_data) as {
		userId: number
	}

	if (!additionalData.userId) {
		return c.json(
			{
				success: false,
				message: 'Invalid user id',
			},
			401
		)
	}

	await db.insert(payments).values({
		userId: additionalData.userId,
		amount: invoice.amount,
		comment: invoice.comment,
		date: invoice.invoice_date,
		paymentSystemId: invoice.payment_id,
		status: 'paid',
		system: 'lolz',
		additionalData: invoice.additional_data,
	})

	return c.status(200)
})
