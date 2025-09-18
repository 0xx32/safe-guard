import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'

export const configTable = pgTable('config_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	key: text().notNull().unique(),
	values: json(),
})
