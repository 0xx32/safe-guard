interface Cart {
	tariffId: number
	periodId: number
}

export interface UserSession {
	cart: Cart
	isWaitingForPayment: boolean
}

export const initialUserSession = (): UserSession => ({
	cart: {
		tariffId: 0,
		periodId: 0,
	},
	isWaitingForPayment: false,
})
