export interface CreateSubscriptionParams {
	userId: number
	telegramId: number
	username: string | null
	internalSquadsIds: string[]
	endDate: Date
	tariffId: number
}
