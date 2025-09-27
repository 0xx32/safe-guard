import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core'

import { timestamps } from '../columns.helpers'
import { subscriptionsToSquadsTable } from './subscriptionsToSquads'

export const squadsTable = pgTable('squads_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	uuid: text().notNull().unique(),
	name: text().notNull().unique(),
	membersCount: integer().notNull(),
	isAvialable: boolean().default(true),
	countryCodes: text().array().default([]),
	...timestamps,
})

export const squadsRelations = relations(squadsTable, ({ many }) => ({
	subscriptions: many(subscriptionsToSquadsTable),
}))
