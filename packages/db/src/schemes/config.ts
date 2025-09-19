import { integer, json, pgTable, text } from 'drizzle-orm/pg-core'

interface PaymentMethod {
	name: string
	key: string
}

interface Config {
	paymentMethods: PaymentMethod[]
}

export const config = pgTable('config_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull().unique(),
	values: json().$type<Config>(),
})
