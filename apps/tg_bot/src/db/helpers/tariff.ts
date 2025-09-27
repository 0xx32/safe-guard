import { tariffsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getTariffById = async (id: number) =>
	(await db.select().from(tariffsTable).where(eq(tariffsTable.id, id))).at(0)

export const getTariffs = async () => await db.select().from(tariffsTable)
