import { getLogger } from '@logtape/logtape'
import { paymentsTable } from '@repo/db/schemes'
import { DrizzleError } from 'drizzle-orm'

import { config } from '@/config'
import { db } from '@/db/client'
import { LztPayService } from '@/external/lztPay.service'

const logger = getLogger(['app', 'db'])

export class PaymentService {
	lztPayService = new LztPayService({
		apiKey: config.LOLZ_API_KEY,
		merchantId: config.LOLZ_MERCHANT_ID,
	})

	constructor() {}

	async createLztPayPayment(userId: number, amount: number) {
		try {
			const newPaymentsReturning = await db
				.insert(paymentsTable)
				.values({
					userId,
					amount,
					method: 'lolz',
					comment: `Пополнение баланса пользователя id: ${userId}`,
				})
				.returning()

			const newPayment = newPaymentsReturning.at(0)

			if (!newPayment) {
				throw new Error('Error creating payment')
			}

			const lztResponse = await this.lztPayService.createInvoice({
				amount,
				comment: `Пополнение баланса пользователя id: ${userId}`,
				url_success: config.SUCCESS_CALLBACK_URL_PAYMENT,
				payment_id: newPayment.id.toString(),
				merchant_id: config.LOLZ_MERCHANT_ID,
				is_test: config.NODE_ENV !== 'production',
				currency: 'RUB',
				additional_data: JSON.stringify({
					userId,
				}),
				url_callback: config.LOLZ_CALLBACK_URL,
			})

			if (!lztResponse) {
				return
			}

			return {
				id: newPayment.id,
				url: lztResponse.invoice.url,
				amount: lztResponse.invoice.amount,
			}
		} catch (error) {
			if (error instanceof DrizzleError) {
				logger.error`Ошибка при создании платежа lolzPay для пользователя id:${userId}\n${error}`
			}

			throw new Error(`Error creating payment\n${error}`)
		}
	}
}

export const paymentService = new PaymentService()
