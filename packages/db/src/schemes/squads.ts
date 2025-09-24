import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const internalSquadsTable = pgTable('internal_squads_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	uuid: text().notNull().unique(), //uuid
	name: text().notNull().unique(),
	membersCount: integer().notNull(),
	locationCode: text().notNull(),
})
