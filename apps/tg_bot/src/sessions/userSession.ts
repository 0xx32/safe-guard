interface SelectedSubscription {
	locationId: number
	periodVariantId: number
	protocolId: number
}

export interface UserSession {
	selectedSubscription: SelectedSubscription
	// order : {
	// 	locationId: number
	// 	periodVariantId: number
	// 	protocolId: number
	// }
}

export const initialUserSession = (): UserSession => ({
	selectedSubscription: {
		locationId: 0,
		periodVariantId: 0,
		protocolId: 0,
	},
})
