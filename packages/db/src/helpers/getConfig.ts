import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { config } from '../schemes'
import { eq } from 'drizzle-orm'

export const getConfig = async (key = 'main', db: PostgresJsDatabase) => {
	const configs = await db.select().from(config).where(eq(config.name, key))
	return configs.at(0)?.values
}
