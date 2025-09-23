import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { timestamps } from '../columns.helpers'
import { internalSquadsTable } from './squads'
import { usersTable } from './user'

export const sybscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'disabled',
	'expired',
])
export const sybscriptionStatusSchema = z.enum(sybscriptionStatusEnum.enumValues)

export const subscriptionsTable = pgTable('subscriptions_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer()
		.notNull()
		.references(() => usersTable.id),
	locationId: integer().notNull(),
	protocolId: integer().notNull(),
	status: sybscriptionStatusEnum().default('disabled'),
	startDate: timestamp().defaultNow().notNull(),
	endDate: timestamp().notNull(),
	subUrl: text(),
	remnawaveUuid: text(),
	remnawaveShortId: text(),
	...timestamps,
})

export const subscriptionsRelations = relations(subscriptionsTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [subscriptionsTable.userId],
		references: [usersTable.id],
	}),
	internalSquads: many(internalSquadsTable),
}))
export type Subscription = typeof subscriptionsTable.$inferSelect
