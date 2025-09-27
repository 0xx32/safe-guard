export const assets = {
	USDT: 'USDT',
	BTC: 'BTC',
	ETH: 'ETH',
	SOL: 'SOL',
	TON: 'TON',
	LTC: 'BNB',
	TRX: 'TRX',
	USDC: 'USDC',
} as const

export interface CryptobotBaseResponse<Data> {
	ok: boolean
	result: Data
	error?: {
		code: number
		name: string
	}
}
export interface CryptobotGetMeResponse {
	userId: number
	id: number
	title: string
	completed: boolean
}
export type CreateInvoiceParams =
	| {
			amount: number
			currencyType: 'fiat'
			fiat: 'USD' | 'RUB'
			asset?: never
			description?: string
			payload: string
			paid_btn_name?: 'openBot' | 'callback' | 'viewItem' | 'openChannel'
			paid_btn_url?: string
	  }
	| {
			amount: number
			currencyType: 'crypto'
			asset: (typeof assets)[keyof typeof assets]
			fiat?: never
			description?: string
			payload: string
			paid_btn_name?: 'openBot' | 'callback' | 'viewItem' | 'openChannel'
			paid_btn_url?: string
	  }

export interface CreateInvoiceResponse {
	invoice_id: number
	hash: string
	currency_type: string
	asset?: string
	fiat?: string
	amount: string
	pay_url: string
	bot_invoice_url: string
	mini_app_invoice_url: string
	web_app_invoice_url: string
	status: string
	created_at: string
	allow_comments: boolean
	allow_anonymous: boolean
}
