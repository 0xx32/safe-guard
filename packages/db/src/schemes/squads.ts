import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core'

import { timestamps } from '../columns.helpers'

export const squadsTable = pgTable('squads_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	uuid: text().notNull().unique(),
	name: text().notNull().unique(),
	membersCount: integer().notNull(),
	isAvialable: boolean().default(true),
	countryCodes: text().array().default([]),
	...timestamps,
})
