import { paymentsTable, paymentSystemsSchema, usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { createHash, createHmac } from 'node:crypto'

import type { CryptoBotInvoicePayload, CryptobotInvoiceResponse } from '@/types/cryptobot'

import { config } from '@/config'
import { db } from '@/db/client'
import { getUserById } from '@/db/helpers/user'

const checkSignature = (token: string, signature: string, data: unknown) => {
	const secretHash = createHash('sha256').update(token).digest()
	const checkString = JSON.stringify(data)
	const hmac = createHmac('sha256', secretHash).update(checkString).digest('hex')
	return hmac === signature
}

export const cryptobot = new Hono()

cryptobot.post('/webhook', async (c) => {
	const signature = c.req.header('crypto-pay-api-signature')

	if (!signature) {
		console.error('Не удалось получить сигнатуру от CryptoBot')
		return c.json(
			{
				status: false,
				message: 'Не удалось получить сигнатуру от CryptoBot',
			},
			401
		)
	}

	const response = await c.req.json<CryptobotInvoiceResponse>()
	const invoice = response.payload

	if (!checkSignature(config.CRYPTOBOT_API_KEY, signature, response)) {
		console.error('Не верная сигнатура')
		return c.json(
			{
				status: false,
				message: 'Не верная сигнатура',
			},
			401
		)
	}

	const { userId, paymentId } = JSON.parse(invoice.payload) as CryptoBotInvoicePayload

	if (!userId) {
		console.error('Не удалось получить id пользователя из payload')

		return c.json(
			{
				status: false,
			},
			404
		)
	}

	try {
		const updatedPayment = await db
			.update(paymentsTable)
			.set({
				amount: +invoice.amount,
				comment: invoice.description,
				date: new Date(invoice.created_at),
				externalId: invoice.invoice_id.toString(),
				status: 'paid',
				method: paymentSystemsSchema.enum.cryptobot,
				updated_at: new Date(Date.now()),
			})
			.where(eq(paymentsTable.id, +paymentId))
			.returning()

		if (!updatedPayment.at(0)) {
			console.error('Не удалось обновить платеж')
			return c.json(
				{
					status: false,
					message: 'Не удалось обновить платеж',
				},
				404
			)
		}
	} catch (error) {
		console.error(error)
		console.error('Не удалось обновить платеж')
	}

	const user = await getUserById(userId)

	if (!user) {
		console.error('Не удалось получить пользователя c id:', userId)
		return c.json(
			{
				status: false,
				message: 'Не удалось получить пользователя',
			},
			404
		)
	}

	await db.update(usersTable).set({
		balance: user.balance + Number(invoice.amount),
	})

	return c.json({ status: true }, 200)
})
