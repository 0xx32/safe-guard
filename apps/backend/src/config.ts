import env from 'env-var'

export const config = {
	POSTGRES_USER: env.get('POSTGRES_USER').required().asString(),
	POSTGRES_PASSWORD: env.get('POSTGRES_PASSWORD').required().asString(),
	POSTGRES_DB: env.get('POSTGRES_DB').required().asString(),
	POSTGRES_PORT: env.get('POSTGRES_PORT').required().asInt(),
	POSTGRES_HOST: env.get('POSTGRES_HOST').required().asString(),

	LOLZ_MERCHANT_ID: env.get('LOLZ_MERCHANT_ID').asString(),
	LOLZ_MERCHANT_API_KEY: env.get('LOLZ_MERCHANT_API_KEY').required().asString(),

	PORT: env.get('PORT').required().asString(),

	CRYPTOBOT_API_KEY: env.get('CRYPTOBOT_API_KEY').required().asString(),
}
