import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'

import { subscriptionsTable } from './subsription'

export const internalSquadsTable = pgTable('internal_squads_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	remanawaveUuid: integer().notNull(),
	name: text().notNull(),
	membersCount: integer().notNull(),
	inboundsIds: text().array().notNull().default([]),
})

export const internalSquadsRelations = relations(internalSquadsTable, ({ many }) => ({
	subscriptions: many(subscriptionsTable),
}))
