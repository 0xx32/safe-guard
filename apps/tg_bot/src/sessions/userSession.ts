interface SelectedSubscription {
	locationId: number
	periodVariantId: number
	protocolId: number
}

export interface UserSession {
	selectedSubscription: SelectedSubscription
}

export const initialUserSession = (): UserSession => ({
	selectedSubscription: {
		locationId: 0,
		periodVariantId: 0,
		protocolId: 0,
	},
})
