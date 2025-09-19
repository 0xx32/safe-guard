import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { payments } from './payment'

export const users = pgTable('users_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	uniqueID: text().unique(),
	telegramID: text().notNull().unique(),
	tgUserName: text(),
	balance: integer().default(0).notNull(),
	lang: text().$type<'ru' | 'en'>().default('ru'),
})

export const subscriptions = pgTable('subscriptions_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer()
		.notNull()
		.references(() => users.id),
})

export type UserType = typeof users.$inferSelect

//RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
	subscriptions: many(subscriptions),
	payments: many(payments),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id],
	}),
}))
