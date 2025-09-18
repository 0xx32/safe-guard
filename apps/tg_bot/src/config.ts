import * as env from 'env-var'

export const config = {
	NODE_ENV: env
		.get('NODE_ENV')
		.default('development')
		.asEnum(['production', 'test', 'development']),
	BOT_TOKEN: env.get('BOT_TOKEN').required().asString(),

	DATABASE_URL: env.get('DATABASE_URL').required().asString(),
	LOCK_STORE: env.get('LOCK_STORE').default('memory').asEnum(['memory']),
	LOLZ_PAY_API_KEY: env.get('LOLZ_PAY_API_KEY').required().asString(),
	LOLZ_API_KEY: env.get('LOLZ_API_KEY').required().asString(),
	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').required().asString(),
	LOLZ_CALLBACK_URL: env.get('LOLZ_CALLBACK_URL').required().asString(),
}
