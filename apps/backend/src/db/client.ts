import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { config } from '@/config'

const DATABASE_URL = `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`

const client = postgres(DATABASE_URL, {
	prepare: false,
})

export const db = drizzle({
	client,
	casing: 'snake_case',
})
