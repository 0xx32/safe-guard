import { locationsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getLocationById = async (id: number) =>
	(await db.select().from(locationsTable).where(eq(locationsTable.id, id))).at(0)
