import { getLogger } from '@logtape/logtape'

import type { LztPayBaseResponse, LztPayCreateInvoiceParams } from './types'

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

export class LztPayError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'LztPayError'
	}
}

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

	private async call(method: 'GET' | 'POST', url: string, body?: unknown) {
		url = `${this.baseUrl}/${url}`

		try {
			const response = await fetch(url, {
				method,
				headers: this.options.headers,
				body: JSON.stringify(body),
			})

			if (!response.ok) {
				throw new LztPayError(
					`Ошибка запроса к LztPay API: ${response.status} ${response.statusText}`
				)
			}

			const json = (await response.json()) as LztPayBaseResponse

			if (json.errors) {
				throw new LztPayError(`LztPay API: ${json.errors.join(', ')}`)
			}

			return json.invoice
		} catch (error) {
			if (error instanceof LztPayError) {
				logger.error(error.message)
			} else {
				console.error(error)
			}
		}
	}

	async createInvoice(invoiceParams: LztPayCreateInvoiceParams) {
		if (invoiceParams.amount <= 0) {
			throw new Error('Amount must be greater than 0')
		}

		logger.info(`Создание инвойса c paymentId: ${invoiceParams.payment_id}`)

		const invoice = await this.call('POST', 'invoice', invoiceParams)

		if (!invoice) {
			logger.info(`Ошибка при создании инвойса c paymentId: ${invoiceParams.payment_id}`)
			return
		}

		logger.info(`LolzPay cоздан invoice c id: ${invoice.invoice_id}`)

		return invoice
	}
}
