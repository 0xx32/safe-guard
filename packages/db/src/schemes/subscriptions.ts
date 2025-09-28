import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { timestamps } from '../columns.helpers'
import { tariffsTable } from './tariffs'
import { usersTable } from './users'

export const sybscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'disabled',
	'expired',
	'trial',
])
export const sybscriptionStatusSchema = z.enum(sybscriptionStatusEnum.enumValues)

export const subscriptionsTable = pgTable('subscriptions_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	uuid: text().notNull().unique(),
	userId: integer()
		.notNull()
		.references(() => usersTable.id),
	status: sybscriptionStatusEnum().default('disabled'),
	isTrial: boolean().default(false),
	startDate: timestamp().defaultNow().notNull(),
	endDate: timestamp().notNull(),
	subUrl: text().notNull(),
	remnawaveUuid: text().notNull(),
	remnawaveShortId: text().notNull(),
	internalSquadsIds: text().array().notNull(),
	tariffId: integer().notNull(),
	...timestamps,
})

export type Subscription = typeof subscriptionsTable.$inferSelect

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [subscriptionsTable.userId],
		references: [usersTable.id],
	}),
	tariff: one(tariffsTable, {
		fields: [subscriptionsTable.tariffId],
		references: [tariffsTable.id],
	}),
}))
