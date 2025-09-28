import { getLogger } from '@logtape/logtape'
import { subscriptionsTable } from '@repo/db/schemes'

import type { CreateSubscriptionParams } from '@/types/subscriptions'

import { db } from '@/db/client'
import { generateRandomString } from '@/utils/helpers/string'

import { remnawave } from '../utils/remnawave'

const logger = getLogger(['db', 'bot'])

export class SubscriptionsService {
	constructor() {}

	async createSubscription(params: CreateSubscriptionParams) {
		const remnawaveResponse = await remnawave.createUser({
			username: `${params.username}-${generateRandomString(5)}`,
			expireAt: params.endDate,
			telegramId: params.telegramId,
			activeInternalSquads: params.internalSquadsIds,
		})

		if (remnawaveResponse.status === 'error') {
			console.error(remnawaveResponse.error)
			logger.error`Ошибка при создании пользователя в Remnawave: ${remnawaveResponse.error}`
			throw new Error(`Error when creating a remnawave user`)
		}

		logger.info`Создан пользователь в Remnawave с uuid: ${remnawaveResponse.data.uuid}`
		try {
			const newSubscriptionResult = await db
				.insert(subscriptionsTable)
				.values({
					uuid: crypto.randomUUID(),
					userId: params.userId,
					status: 'active',
					startDate: new Date(remnawaveResponse.data.createdAt),
					endDate: params.endDate,
					subUrl: remnawaveResponse.data.subscriptionUrl,
					remnawaveShortId: remnawaveResponse.data.shortUuid,
					remnawaveUuid: remnawaveResponse.data.uuid,
					internalSquadsIds: params.internalSquadsIds,
					tariffId: params.tariffId,
				})
				.returning({
					id: subscriptionsTable.id,
					subUrl: subscriptionsTable.subUrl,
					endData: subscriptionsTable.endDate,
					uuid: subscriptionsTable.uuid,
				})

			logger.info`Создана подписка с id: ${newSubscriptionResult[0]!.id}`
			return newSubscriptionResult[0]!
		} catch (error) {
			logger.error`Ошибка при создании подписки или user Remnawave`
			throw new Error(`Error when creating a subscription\n
			${error}`)
		}
	}
}

export const subscriptionsService = new SubscriptionsService()
