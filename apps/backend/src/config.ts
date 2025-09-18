import env from 'env-var'

export const config = {
	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').asString(),
	DATABASE_URL: env.get('DATABASE_URL').required().asString(),
}
