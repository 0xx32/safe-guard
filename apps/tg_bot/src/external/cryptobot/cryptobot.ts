import { getLogger } from '@logtape/logtape'

import type {
	CreateInvoiceParams,
	CreateInvoiceResponse,
	CryptobotBaseResponse,
	CryptobotGetMeResponse,
} from './types'

const testnetUrl = 'https://testnet-pay.crypt.bot'

const logger = getLogger(['app'])

export class CryptoBotError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'CryptoBotError'
	}
}

export class CryptoBotService {
	baseUrl = 'https://pay.crypt.bot'
	apiKey: string
	headers = {
		'Content-Type': 'application/json',
	}

	constructor({ apiKey, isTest }: { apiKey: string; isTest: boolean }) {
		if (!apiKey) {
			logger.error(`CryptoBot API token не указан`)
			throw new CryptoBotError('API token не указан')
		}

		this.apiKey = apiKey
		this.baseUrl = isTest ? testnetUrl : this.baseUrl
	}

	private async call<Data>(method: 'GET' | 'POST', url: string, body?: unknown) {
		url = `${this.baseUrl}/api/${url}`

		try {
			const response = await fetch(url, {
				method,
				headers: { ...this.headers, 'Crypto-Pay-API-Token': this.apiKey },
				body: body ? JSON.stringify(body) : undefined,
			})

			if (!response.ok) {
				throw new CryptoBotError(
					`Ошибка запроса к CryptoBot API: ${response.status} ${response.statusText}`
				)
			}

			const json = (await response.json()) as CryptobotBaseResponse<Data>

			if (!json.ok) {
				throw new CryptoBotError(`CryptoBot API:${json.error?.code} ${json.error?.name}`)
			}

			return json.result
		} catch (error) {
			if (error instanceof CryptoBotError) {
				logger.error(error.message)
			} else {
				console.error(error)
			}
		}
	}

	async getMe() {
		return this.call<CryptobotGetMeResponse>('GET', 'getMe')
	}

	async createInvoice(params: CreateInvoiceParams) {
		const result = await this.call<CreateInvoiceResponse>('POST', 'createInvoice', {
			...params,
			currency_type: params.currencyType,
		})

		if (result) {
			logger.info(
				`Создан CryptoBot invoice id:${result.invoice_id} amount:${result.amount} asset:${result.fiat || result.asset}`
			)
		}

		return result
	}

	async deleteInvoice(id: CreateInvoiceResponse['invoice_id']) {
		const result = await this.call<boolean>('POST', 'deleteInvoice', { invoice_id: id })

		if (result) {
			logger.error(`CryptoBot удаление инвойса c id: ${id}`)
		}

		return result
	}
}
