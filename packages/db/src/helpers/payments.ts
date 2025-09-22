import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { eq } from 'drizzle-orm'

import { paymentsTable } from '../schemes'

export const getPaymentById = async (id: number, db: PostgresJsDatabase) =>
	(await db.select().from(paymentsTable).where(eq(paymentsTable.id, id))).at(0)
