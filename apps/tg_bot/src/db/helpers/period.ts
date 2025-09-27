import { periodsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getPeriodById = async (id: number) =>
	(await db.select().from(periodsTable).where(eq(periodsTable.id, id))).at(0)
