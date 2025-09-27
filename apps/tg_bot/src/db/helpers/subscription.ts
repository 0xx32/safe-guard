import { subscriptionsTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getSubscriptionById = async (id: number) =>
	(await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id))).at(0)

export const getUserSubscriptionsById = async (userId: number) =>
	db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId))
