import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { config } from '@/config'

const client = postgres(config.DATABASE_URL, {
	prepare: false,
})

export const db = drizzle({
	client,
	casing: 'snake_case',
})
