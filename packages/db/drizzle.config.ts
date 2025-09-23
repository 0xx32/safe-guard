import type { Config } from 'drizzle-kit'

import { config } from './src/config'

export default {
	schema: './src/schemes',
	out: './drizzle',
	dialect: 'postgresql',
	casing: 'snake_case',
	dbCredentials: {
		url: config.DATABASE_URL,
	},
} satisfies Config
