import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { users } from './user'

export const paymentSystemsEnum = pgEnum('payment_system', ['lolz'])
export const statusPaymentEnum = pgEnum('status_payment', ['paid', 'not_paid'])

export const payments = pgTable('payments_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	system: paymentSystemsEnum().notNull(),
	paymentSystemId: text().notNull(),
	userId: integer()
		.notNull()
		.references(() => users.id),
	amount: integer().notNull(),
	comment: text(),
	date: integer().notNull(),
	status: statusPaymentEnum().default('not_paid'),
	additionalData: text(),
})

export const paymentsRelation = relations(payments, ({ one }) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id],
	}),
}))

export type PaymentType = typeof payments.$inferSelect
