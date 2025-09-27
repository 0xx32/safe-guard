export interface GetAllInternalSquadsResponse {
	total: number
	internalSquads: InternalSquad[]
}

export interface InternalSquad {
	uuid: string
	name: string
	info: Info
	inbounds: Inbound[]
	createdAt: string
	updatedAt: string
}

export interface Info {
	membersCount: number
	inboundsCount: number
}

export interface Inbound {
	uuid: string
	profileUuid: string
	tag: string
	type: string
	network: string | null
	security: string | null
	port: number | null
	rawInbound: null
}
export interface AccessibleNode {
	uuid: string
	nodeName: string
	countryCode: string
	configProfileUuid: string
	configProfileName: string
	activeInbounds: string[]
}

export interface InternalSquadAccessibleNodes {
	squadUuid: string
	accessibleNodes: AccessibleNode[]
}
