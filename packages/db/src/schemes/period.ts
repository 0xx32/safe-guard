import { integer, pgTable } from 'drizzle-orm/pg-core'

export const periodsTable = pgTable('periods_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	discount: integer().notNull(),
	durationInDays: integer().notNull(),
})
