import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import env from 'env-var'

import * as schema from './schemes'

const DATABASE_URL = env.get('DATABASE_URL').required().asString()

const client = postgres(DATABASE_URL, {
	prepare: false,
})

export const db = drizzle({
	client,
	casing: 'snake_case',
	schema,
})
