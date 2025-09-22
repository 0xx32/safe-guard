import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { eq } from 'drizzle-orm'

import { configTable } from '../schemes'

export const getConfig = async (key = 'main', db: PostgresJsDatabase) => {
	const configs = await db.select().from(configTable).where(eq(configTable.name, key))
	return configs.at(0)?.values
}
