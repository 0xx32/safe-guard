import { usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getUserById = async (id: number) => {
	const user = await db.select().from(usersTable).where(eq(usersTable.id, id))
	return user[0]
}
