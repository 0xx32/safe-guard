export interface Invoice {
	invoice_id: number
	user_id: number
	merchant_id: number
	invoice_date: number
	expires_at: number
	amount: number
	status: string
	paid_date: number
	payer_user_id: number
	payment_id: string
	additional_data: string
	comment: string
	url_success: string
	url_callback: string
	is_test: number
	payer_username: string
}
