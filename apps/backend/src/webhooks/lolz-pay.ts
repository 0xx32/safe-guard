import { Hono } from 'hono'

import { globalConfig } from '@/config'

export interface Invoice {
	invoice_id: number
	user_id: number
	merchant_id: number
	invoice_date: number
	expires_at: number
	amount: number
	status: string
	paid_date: number
	payer_user_id: number
	payment_id: string
	additional_data: string
	comment: string
	url_success: string
	url_callback: string
	is_test: number
	payer_username: string
}

export const lolzPay = new Hono()

lolzPay.post('/webhook', async (c) => {
	const secretKey = c.req.header('x-secret-key')

	if (secretKey !== globalConfig.LOLZ_MERCHANT_ID) {
		return c.text('Invalid secret key', 401)
	}

	// const invoice =  await c.req.json<Invoice>()

	// console.log(invoice);
	console.log(await c.req.json())

	return c.json({
		success: true,
		message: 'ok',
	})
}) // GET /book
