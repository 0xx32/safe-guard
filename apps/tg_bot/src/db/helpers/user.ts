import { usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'

export const getUserByTelegramId = async (id: number) =>
	(await db.select().from(usersTable).where(eq(usersTable.telegramId, id.toString()))).at(0)

export const getAllUsers = async () => db.select().from(usersTable)

export const getUserById = async (id: number) =>
	(await db.select().from(usersTable).where(eq(usersTable.id, id))).at(0)

export const updateUserBalance = async (userId: number, updateBalance: number) =>
	(
		await db
			.update(usersTable)
			.set({ balance: updateBalance })
			.where(eq(usersTable.id, userId))
			.returning({ userBalance: usersTable.balance })
	).at(0)
