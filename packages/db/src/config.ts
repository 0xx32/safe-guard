import env from 'env-var'

const envConfig = {
	POSTGRES_USER: env.get('POSTGRES_USER').required().asString(),
	POSTGRES_PASSWORD: env.get('POSTGRES_PASSWORD').required().asString(),
	POSTGRES_DB: env.get('POSTGRES_DB').required().asString(),
	POSTGRES_PORT: env.get('POSTGRES_PORT').required().asString(),
	POSTGRES_HOST: env.get('POSTGRES_HOST').required().asString(),
}

export const config = {
	DATABASE_URL: `postgresql://${envConfig.POSTGRES_USER}:${envConfig.POSTGRES_PASSWORD}@${envConfig.POSTGRES_HOST}:${envConfig.POSTGRES_PORT}/${envConfig.POSTGRES_DB}`,
} as const
