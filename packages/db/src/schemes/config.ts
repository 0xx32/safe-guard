import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'

import type { Config } from '../types/config.interface'

export const config = pgTable('config_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull().unique(),
	values: json().$type<Config>(),
})
