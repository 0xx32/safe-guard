import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { timestamps } from '../columns.helpers'
import { usersTable } from './users'

export const paymentMethodEnum = pgEnum('payment_system', ['lolz', 'cryptobot'])
export const paymentSystemsSchema = z.enum(paymentMethodEnum.enumValues)

export const statusPaymentEnum = pgEnum('status_payment', ['paid', 'not_paid', 'canceled'])
export const statusPaymentSchema = z.enum(statusPaymentEnum.enumValues)

export const paymentsTable = pgTable('payments_table', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer()
		.notNull()
		.references(() => usersTable.id),
	amount: integer().notNull(),
	method: paymentMethodEnum(),
	externalId: text(),
	comment: text(),
	date: timestamp(),
	status: statusPaymentEnum().default('not_paid'),
	...timestamps,
})

export const paymentsRelation = relations(paymentsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [paymentsTable.userId],
		references: [usersTable.id],
	}),
}))

export type Payment = typeof paymentsTable.$inferSelect
