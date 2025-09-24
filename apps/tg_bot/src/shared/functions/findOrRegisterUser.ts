import type { UserSelectParams } from '@repo/db/schemes'

import { usersTable } from '@repo/db/schemes'

import { db } from '@/db/client'
import { getUserByTelegramId } from '@/db/helpers'

type UserParams = Partial<Omit<UserSelectParams, 'id'>> & { telegramId: number }

export const registerUser = async (userParams: UserParams) => {
	const newUser = await db.insert(usersTable).values({
		telegramId: userParams.telegramId,
		telegramUsername: userParams.telegramUsername,
		uuid: crypto.randomUUID(),
		firstName: userParams.firstName,
		lastName: userParams.lastName,
	})

	return newUser
}

export const findOrRegisterUser = async (userParams: UserParams) => {
	const user = await getUserByTelegramId(userParams.telegramId)

	if (user) return user

	try {
		const newUser = await db
			.insert(usersTable)
			.values({
				telegramId: userParams.telegramId,
				telegramUsername: userParams.telegramUsername,
				uuid: crypto.randomUUID(),
				firstName: userParams.firstName,
				lastName: userParams.lastName,
			})
			.returning()

		return newUser[0]!
	} catch (error) {
		throw new Error(`Error registering user
			${error}
			`)
	}
}
