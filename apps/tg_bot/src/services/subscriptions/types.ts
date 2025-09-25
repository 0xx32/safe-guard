export interface createSubscriptionParams {
	userId: number
	telegramId: number
	username: string | null
	locationId: number
	protocolId: number
	internalSquadsIds: string[]
	duration: number
}
