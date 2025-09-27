export interface CreateSubscriptionParams {
	userId: number
	telegramId: number
	username: string | null
	internalSquadsIds: string[]
	duration: number
	tariffId: number
}
