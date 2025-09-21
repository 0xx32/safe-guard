export interface UserSession {
	selectedSubscription?: {
		locationId?: number
		periodVariantId?: number
		protocolId?: number
	}
}

export const initialUserSession = (): UserSession => ({})
