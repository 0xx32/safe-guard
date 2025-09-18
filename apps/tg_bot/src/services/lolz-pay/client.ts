import type { AxiosInstance, CreateAxiosDefaults } from 'axios'

import axios from 'axios'

import type { MyRequestConfig } from '@/utils/types'

import { config as globalConfig } from '@/config'

import type { InvoiceParams, ResponseCreateInvoice } from './types'

const clientOptions: CreateAxiosDefaults = {
	baseURL: 'https://prod-api.lzt.market',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${globalConfig.LOLZ_API_KEY}`,
	},
}

export class LztPay {
	api: AxiosInstance

	constructor() {
		this.api = axios.create(clientOptions)
	}

	async createInvoice({ params, config }: MyRequestConfig<InvoiceParams>) {
		if (params.amount <= 0) {
			throw new Error('Amount must be greater than 0')
		}

		params.merchant_id = Number(globalConfig.LOLZ_MERCHANT_ID)

		const searchParams = new URLSearchParams()

		for (const [key, value] of Object.entries(params)) {
			searchParams.append(key, value)
		}

		return this.api.post<ResponseCreateInvoice>(
			`invoice?${searchParams.toString()}`,
			{},
			config
		)
	}
}
