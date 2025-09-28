import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'

import { squadsTable } from './squads'
import { subscriptionsTable } from './subscriptions'

export const tariffTypeEnum = pgEnum('tariff_type', [
	'ALL_COUNTRY',
	'SINGLE_COUNTRY',
	'YOUTUBE',
	'RUSSIA',
	'EUROPE',
	'TRIAL',
])

export const tariffsTable = pgTable('tariffs_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	priceInMonth: integer().notNull().default(100),
	label: text().notNull(),
	type: tariffTypeEnum().notNull(),
	squadUuid: text().notNull().unique(),
	isActive: boolean().notNull().default(true),
	isPrivate: boolean().notNull().default(false),
})

export const tariffsRelations = relations(tariffsTable, ({ many, one }) => ({
	subscription: many(subscriptionsTable),
	squad: one(squadsTable, {
		fields: [tariffsTable.squadUuid],
		references: [squadsTable.uuid],
	}),
}))

export type Tariff = typeof tariffsTable.$inferSelect
export type TariffInsert = typeof tariffsTable.$inferInsert
