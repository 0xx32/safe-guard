import * as env from 'env-var'

export const config = {
	NODE_ENV: env
		.get('NODE_ENV')
		.default('development')
		.asEnum(['production', 'test', 'development']),
	BOT_TOKEN: env.get('BOT_TOKEN').required().asString(),

	LOCK_STORE: env.get('LOCK_STORE').default('memory').asEnum(['memory']),
	LOLZ_API_KEY: env.get('LOLZ_API_KEY').required().asString(),
	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').required().asString(),
	LOLZ_CALLBACK_URL: env.get('LOLZ_CALLBACK_URL').required().asString(),

	POSTGRES_USER: env.get('POSTGRES_USER').required().asString(),
	POSTGRES_PASSWORD: env.get('POSTGRES_PASSWORD').required().asString(),
	POSTGRES_DB: env.get('POSTGRES_DB').required().asString(),
	POSTGRES_PORT: env.get('POSTGRES_PORT').required().asString(),
	POSTGRES_HOST: env.get('POSTGRES_HOST').required().asString(),
}
