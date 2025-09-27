import { getLogger } from '@logtape/logtape'
import { paymentsTable } from '@repo/db/schemes'

import type { CreateInvoiceParams as CryptobotCreateInvoiceParams } from '@/external/cryptobot/types'

import { config } from '@/config'
import { db } from '@/db/client'
import { CryptoBotService } from '@/external/cryptobot'
import { LztPayService } from '@/external/lztPay/lztPay'

const logger = getLogger(['app', 'db'])

interface CreatePamentParams {
	userId: number
	amount: number
	method: 'lolz' | 'cryptobot'
	description: string
}

export class PaymentService {
	lztPayService = new LztPayService({
		apiKey: config.LOLZ_API_KEY,
		merchantId: config.LOLZ_MERCHANT_ID,
	})
	cryptobotService = new CryptoBotService({
		apiKey: config.CRYPTOBOT_API_KEY,
		isTest: config.NODE_ENV !== 'production',
	})

	constructor() {}

	async createPayment({ userId, amount, method, description }: CreatePamentParams) {
		try {
			const paymentResult = await db
				.insert(paymentsTable)
				.values({
					userId,
					amount,
					method,
					comment: description,
				})
				.returning()

			const payment = paymentResult.at(0)

			if (!payment) {
				throw new Error('Ошибка при создании Payment в базе данных')
			}

			logger.info`Создан Payment в базе данных id:${payment.id}`

			return {
				id: payment.id,
				url: `https://pay.crypt.bot/invoice/${payment.id}`,
				amount,
				payment,
			}
		} catch (error) {
			if (error instanceof Error) {
				logger.error(error.message)
			}
		}
	}

	async createLztPayPayment(userId: number, amount: number, description: string) {
		const newPayment = await this.createPayment({
			userId,
			amount,
			method: 'lolz',
			description: description || `Пополнение баланса пользователя id: ${userId}`,
		})

		if (!newPayment) {
			logger.error`Ошибка при создании Payment в базе данных, userId:${userId} amount:${amount}`
			return
		}

		const invoice = await this.lztPayService.createInvoice({
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

		if (!invoice) {
			logger.error`Ошибка при запроса создания invoice LztPay, paymentId:${newPayment.id}`
			return
		}

		return invoice
	}
	async createCryptobotPayment(
		params: {
			userId: number
		} & Omit<CryptobotCreateInvoiceParams, 'payload'>
	) {
		if (
			(!params.paid_btn_name && params.paid_btn_url) ||
			(!params.paid_btn_url && params.paid_btn_name)
		) {
			throw new Error('paid_btn_name и paid_btn_url должны быть вместе указаны или оба не указаны')
		}

		const newPayment = await this.createPayment({
			userId: params.userId,
			amount: params.amount,
			method: 'cryptobot',
			description: params.description || `Пополнение баланса пользователя id: ${params.userId}`,
		})

		if (!newPayment) {
			logger.error`Ошибка при создании Payment в базе данных, params:${params}`
			return
		}

		const invoice = await this.cryptobotService.createInvoice({
			amount: params.amount,
			currencyType: 'fiat',
			fiat: 'RUB',
			payload: JSON.stringify({ userId: params.userId, paymentId: newPayment.id }),
			description: params.description || `Пополнение баланса пользователя id: ${params.userId}`,
			paid_btn_name: params.paid_btn_name,
			paid_btn_url: params.paid_btn_url,
		})

		if (!invoice) {
			logger.error`Ошибка при запроса создания invoice CryptoBot, paymentId:${newPayment.id}`
			return
		}

		logger.info`Создан invoice CryptoBot paymentId:${newPayment.id} invoiceId:${invoice.invoice_id} amount:${invoice.amount} asset:${invoice.fiat || invoice.asset}`

		return {
			id: newPayment.id,
			url: invoice.bot_invoice_url,
			amount: invoice.amount,
			invoice,
		}
	}
}

export const paymentService = new PaymentService()
