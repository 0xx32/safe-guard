import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'

import type { Config } from '../types/config.interface'

const defaultConfig: Config = {
	periods: {},
	protocols: {},
	paymentMethods: [],
	shopName: 'Winter Shop',
}

export const configTable = pgTable('config_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull().unique(),
	values: json().$type<Config>().default(defaultConfig),
})
