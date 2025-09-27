import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const locationsTable = pgTable('locations_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	squadUuid: text().unique(),
	symbol: text().notNull(),
	name: text().notNull(),
	icon: text().notNull(),
	supplementToPrice: integer().default(0).notNull(),
	isActive: boolean().default(true).notNull(),
})

export type Location = typeof locationsTable.$inferSelect
