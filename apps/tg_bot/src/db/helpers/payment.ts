import { paymentsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getPaymentById = async (id: number) =>
	(await db.select().from(paymentsTable).where(eq(paymentsTable.id, id))).at(0)
