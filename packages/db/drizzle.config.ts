import type { Config } from 'drizzle-kit'

import env from 'env-var'

const DATABASE_URL = env.get('DATABASE_URL').required().asString()

export default {
	schema: './src/db/schemes',
	out: './drizzle',
	dialect: 'postgresql',
	casing: 'snake_case',
	dbCredentials: {
		url: DATABASE_URL,
	},
} satisfies Config
