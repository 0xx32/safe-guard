import { getLogger } from '@logtape/logtape'

import type { CreateInvoiceParams, CreateInvoiceResponse, LztPayError } from '@/types/lztPay'

const defaultOptions = {
	headers: {
		'Content-Type': 'application/json',
	},
}

interface LztPayOptions {
	apiKey: string
	merchantId: number
	headers?: Record<string, string>
}

const logger = getLogger(['app'])

export class LztPayService {
	baseUrl = 'https://prod-api.lzt.market'
	options: LztPayOptions

	constructor(options: LztPayOptions) {
		this.options = {
			...options,
			headers: {
				...defaultOptions.headers,
				Authorization: `Bearer ${options.apiKey}`,
				...options.headers,
			},
		}
	}

	async createInvoice(invoiceParams: CreateInvoiceParams) {
		if (invoiceParams.amount <= 0) {
			throw new Error('Amount must be greater than 0')
		}
		try {
			logger.info(`Создание инвойса c paymentId: ${invoiceParams.payment_id}`)

			const response = await fetch(`${this.baseUrl}/invoice`, {
				method: 'POST',
				headers: this.options.headers,
				body: JSON.stringify(invoiceParams),
			})

			const data = (await response.json()) as CreateInvoiceResponse | LztPayError

			if ('errors' in data) {
				logger.info(
					`Ошибка при создании инвойса c paymentId: ${invoiceParams.payment_id}. Errors: ${data.errors}`
				)
				return
			}

			logger.info(`Создан инвойс c id: ${data.invoice.invoice_id}`)
			return data
		} catch (error) {
			logger.error(`Ошибка при создании инвойса c paymentId: ${invoiceParams.payment_id}`)

			if (error instanceof Error) {
				throw new Error(error.message)
			}
		}
	}
}
