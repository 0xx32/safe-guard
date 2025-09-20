import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { timestamps } from '../columns.helpers'
import { usersTable } from './user'

export const sybscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'disabled',
	'expired',
])
export const sybscriptionStatusSchema = z.enum(
	sybscriptionStatusEnum.enumValues
)

export const subscriptionsTable = pgTable('subscriptions_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer()
		.notNull()
		.unique()
		.references(() => usersTable.id),
	status: sybscriptionStatusEnum().default('disabled'),
	startDate: timestamp().defaultNow().notNull(),
	endDate: timestamp().notNull(),
	subsctionUrl: text(),
	remnawaveShortId: text(),
	...timestamps,
})

export const subscriptionsRelations = relations(
	subscriptionsTable,
	({ one }) => ({
		user: one(usersTable, {
			fields: [subscriptionsTable.userId],
			references: [usersTable.id],
		}),
	})
)
export type Subscription = typeof subscriptionsTable.$inferSelect
