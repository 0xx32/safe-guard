import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'

import { squadsTable } from './squads'
import { subscriptionsTable } from './subsription'

export const tariffTypeEnum = pgEnum('tariff_type', [
	'ALL_COUNTRY',
	'SINGLE_COUNTRY',
	'YOUTUBE',
	'RUSSIA',
	'EUROPE',
])

export const tariffTable = pgTable('tariff_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	price: integer().notNull().default(0),
	label: text().notNull(),
	type: tariffTypeEnum().notNull(),
	squadId: integer().notNull(),
	subscriptionDurationInDays: integer().notNull(),
})

export const tariffsRelations = relations(tariffTable, ({ many, one }) => ({
	subscription: many(subscriptionsTable),
	squad: one(squadsTable, {
		fields: [tariffTable.squadId],
		references: [squadsTable.id],
	}),
}))

export type Tariff = typeof tariffTable.$inferSelect
export type TariffInsert = typeof tariffTable.$inferInsert
