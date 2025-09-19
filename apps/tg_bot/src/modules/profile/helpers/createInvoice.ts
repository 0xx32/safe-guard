import type { InvoiceParams } from '@/services/lolz-pay'

import { LztPay } from '@/services/lolz-pay'

const lolzAPi = new LztPay()

export const createInvoiceLolzPay = async (params: InvoiceParams) => {
	try {
		const invoiceResponse = await lolzAPi.createInvoice({ params })

		return invoiceResponse.data.invoice
	} catch (error) {
		console.log(error)
	}
}
