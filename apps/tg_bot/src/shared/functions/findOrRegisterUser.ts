import { usersTable } from '@repo/db/schemes'

import { db } from '@/db/client'
import { getUserByTelegramId } from '@/db/helpers'

interface UserParams {
	telegramId: number
	telegramUsername: string
	uuid: string
	firstName: string
	lastName: string
	lang: string
}

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

	const newUser = await registerUser(userParams)

	return newUser
}
