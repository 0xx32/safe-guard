import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { eq } from 'drizzle-orm'

import { usersTable } from '../schemes'

export const getAllUsers = async (db: PostgresJsDatabase) =>
	db.select().from(usersTable)

export const getUserById = async (id: number, db: PostgresJsDatabase) =>
	(await db.select().from(usersTable).where(eq(usersTable.id, id))).at(0)
