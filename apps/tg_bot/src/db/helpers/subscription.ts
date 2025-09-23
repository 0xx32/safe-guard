import { subscriptionsTable, usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import { db } from '../client'

export const getUserSubscriptionByTelegramId = async (telegramId: number) =>
	db
		.select({
			id: subscriptionsTable.id,
			userId: subscriptionsTable.userId,
			status: subscriptionsTable.status,
			startDate: subscriptionsTable.startDate,
			endDate: subscriptionsTable.endDate,
			subUrl: subscriptionsTable.subUrl,
			remnawaveUuid: subscriptionsTable.remnawaveUuid,
			remnawaveShortId: subscriptionsTable.remnawaveShortId,
			updated_at: subscriptionsTable.updated_at,
			created_at: subscriptionsTable.created_at,
			deleted_at: subscriptionsTable.deleted_at,
			locationId: subscriptionsTable.locationId,
			protocolId: subscriptionsTable.protocolId,
		})
		.from(usersTable)
		.leftJoin(subscriptionsTable, eq(usersTable.id, subscriptionsTable.userId))
		.where(eq(usersTable.telegramId, telegramId))
