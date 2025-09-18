import * as env from 'env-var'

export const globalConfig = {
	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').asString(),
}
