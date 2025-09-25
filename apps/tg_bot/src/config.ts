import env from 'env-var'

export const config = {
	NODE_ENV: env
		.get('NODE_ENV')
		.default('development')
		.asEnum(['production', 'test', 'development']),
	LOCK_STORE: env.get('LOCK_STORE').default('memory').asEnum(['memory']),

	BOT_TOKEN: env.get('BOT_TOKEN').required().asString(),

	LOLZ_API_KEY: env.get('LOLZ_API_KEY').required().asString(),
	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').required().asInt(),
	LOLZ_CALLBACK_URL: env.get('LOLZ_CALLBACK_URL').required().asString(),

	POSTGRES_USER: env.get('POSTGRES_USER').required().asString(),
	POSTGRES_PASSWORD: env.get('POSTGRES_PASSWORD').required().asString(),
	POSTGRES_DB: env.get('POSTGRES_DB').required().asString(),
	POSTGRES_PORT: env.get('POSTGRES_PORT').required().asInt(),
	POSTGRES_HOST: env.get('POSTGRES_HOST').required().asString(),

	REMNAWAVE_API_KEY: env.get('REMNAWAVE_API_KEY').required().asString(),
	REMNAWAVE_API_URL: env.get('REMNAWAVE_API_URL').required().asString(),

	REDIS_HOST: env.get('REDIS_HOST').required().asString(),
	REDIS_PORT: env.get('REDIS_PORT').required().asInt(),
	REDIS_PASSWORD: env.get('REDIS_PASSWORD').required().asString(),
	REDIS_USERNAME: env.get('REDIS_USERNAME').required().asString(),

	SUCCESS_CALLBACK_URL_PAYMENT: env.get('SUCCESS_CALLBACK_URL_PAYMENT').required().asString(),
} as const
