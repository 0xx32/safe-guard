import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const internalSquadsTable = pgTable('internal_squads_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	remanawaveUuid: integer().notNull(),
	name: text().notNull(),
	membersCount: integer().notNull(),
	inboundsIds: text().array().notNull().default([]),
})
