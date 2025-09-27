import { relations } from 'drizzle-orm'
import { integer, pgTable } from 'drizzle-orm/pg-core'

import { squadsTable } from './squads'
import { subscriptionsTable } from './subsription'

export const subscriptionsToSquadsTable = pgTable('subscriptions_to_squads_table', {
	subscriptionId: integer()
		.notNull()
		.references(() => subscriptionsTable.id),
	squadId: integer()
		.notNull()
		.references(() => squadsTable.id),
})

export const subscriptionsToSquadsRelations = relations(subscriptionsToSquadsTable, ({ one }) => ({
	subscription: one(subscriptionsTable, {
		fields: [subscriptionsToSquadsTable.subscriptionId],
		references: [subscriptionsTable.id],
	}),
	role: one(squadsTable, {
		fields: [subscriptionsToSquadsTable.subscriptionId],
		references: [squadsTable.id],
	}),
}))
