import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user'
import { timestamps } from '../columns.helpers'
import { number, z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'

export const paymentSystemsEnum = pgEnum('payment_system', ['lolz'])
export const paymentSystemsSchema = z.enum(paymentSystemsEnum.enumValues)

export const statusPaymentEnum = pgEnum('status_payment', ['paid', 'not_paid'])

export const payments = pgTable('payments_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	system: paymentSystemsEnum().notNull(),
	paymentSystemId: text(),
	userId: integer()
		.notNull()
		.references(() => users.id),
	amount: integer().notNull(),
	comment: text(),
	date: integer(),
	status: statusPaymentEnum().default('not_paid'),
	...timestamps,
})

export const paymentsRelation = relations(payments, ({ one }) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id],
	}),
}))

export type PaymentType = typeof payments.$inferSelect
