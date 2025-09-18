export interface Invoice {
	amount: number
	payment_id: string
	merchant_id: number
	comment: string
	additional_data: string
	url_success: string
	url_callback: string
	is_test: number
	expires_at: number
	user_id: number
	invoice_date: number
	status: string
	paid_date: number
	payer_user_id: number
	resend_attempts: number
	invoice_id: number
	url: string
	currency: string
}

export interface InvoiceParams {
	amount: number
	currency: string
	payment_id: string
	comment: string
	url_success: string
	url_callback?: string
	merchant_id: number
	lifetime?: number
	additional_data?: string
	is_test?: boolean
}

export interface ResponseCreateInvoice {
	invoice: Invoice
}

export interface LolzError {
	errors: string[]
}
