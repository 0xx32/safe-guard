import { squadsTable } from '@repo/db/schemes'

import { db } from '../client'

export const getInternalSquadsIds = async () =>
	db.select({ id: squadsTable.uuid }).from(squadsTable)
