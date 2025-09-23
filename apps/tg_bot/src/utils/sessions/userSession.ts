interface Cart {
	locationId: number
	periodId: number
	protocolId: number
}

export interface UserSession {
	cart: Cart
}

export const initialUserSession = (): UserSession => ({
	cart: {
		locationId: 0,
		periodId: 0,
		protocolId: 0,
	},
})
