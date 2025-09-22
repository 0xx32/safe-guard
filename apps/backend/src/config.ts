import env from 'env-var'

export const config = {
	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').asString(),
	LOLZ_MERCHANT_API_KEY: env.get('LOLZ_MERCHANT_API_KEY').required().asString(),
	DATABASE_URL: env.get('DATABASE_URL').required().asString(),
	PORT: env.get('PORT').required().asString(),
}
