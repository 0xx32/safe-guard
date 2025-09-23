import { relations } from 'drizzle-orm'
import { bigint, integer, pgTable, text } from 'drizzle-orm/pg-core'

import { timestamps } from '../columns.helpers'
import { generateUUID } from '../utils'
import { paymentsTable } from './payment'
import { subscriptionsTable } from './subsription'

export const usersTable = pgTable('users_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	uuid: text().unique().default(generateUUID()),
	telegramId: bigint({ mode: 'number' }).notNull().unique(),
	telegramUsername: text(),
	firstName: text(),
	lastName: text(),
	balance: integer().default(0).notNull(),
	lang: text().$type<'ru' | 'en'>().default('ru'),
	...timestamps,
})

export const usersRelations = relations(usersTable, ({ many }) => ({
	subscriptions: many(subscriptionsTable),
	payments: many(paymentsTable),
}))

export type User = typeof usersTable.$inferSelect
