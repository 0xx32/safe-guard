import { configTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getConfig = async (key = 'main') => {
	const configs = await db.select().from(configTable).where(eq(configTable.name, key))
	return configs.at(0)?.values
}
