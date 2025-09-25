export interface CryptobotInvoiceResponse {
	update_id: number
	update_type: 'invoice_paid'
	request_date: Date
	payload: CryptobotInvoice
}

export interface CryptoBotInvoicePayload {
	userId: number
	paymentId: string
}

export interface CryptobotInvoice {
	invoice_id: number
	hash: string
	currency_type: string
	fiat: string
	amount: string
	paid_asset: string
	paid_amount: string
	paid_fiat_rate: string
	accepted_assets: string[]
	description: string
	pay_url: string
	status: 'paid' | 'unpaid'
	created_at: Date
	payload: string
}
