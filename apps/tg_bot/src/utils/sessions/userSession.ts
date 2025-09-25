interface Cart {
	locationId: number
	periodId: number
	protocolId: number
}

export interface UserSession {
	cart: Cart
	isWaitingForPayment: boolean
}

export const initialUserSession = (): UserSession => ({
	cart: {
		locationId: 0,
		periodId: 0,
		protocolId: 0,
	},
	isWaitingForPayment: false,
})
