export type UserStatus = 'ACTIVE ' | 'DISABLED ' | 'LIMITED ' | 'EXPIRED '

export interface CreateUserParams {
	username: string
	expireAt: Date
	status?: UserStatus
	shortUuid?: string
	trojanPassword?: string
	vlessUuid?: string
	ssPassword?: string
	trafficLimitBytes?: number
	trafficLimitStrategy?: string
	createdAt?: string
	lastTrafficResetAt?: string
	description?: string
	tag?: string
	telegramId?: number
	email?: string
	hwidDeviceLimit?: number
	activeInternalSquads?: string[]
}

export interface ResponseUser {
	uuid: string
	shortUuid: string
	username: string
	status: string
	usedTrafficBytes: number
	lifetimeUsedTrafficBytes: number
	trafficLimitBytes: number
	trafficLimitStrategy: TrafficLimitStrategy
	subLastUserAgent: string | null
	subLastOpenedAt: string | null
	expireAt: string
	onlineAt: string | null
	subRevokedAt: any
	lastTrafficResetAt: string | null
	trojanPassword: string
	vlessUuid: string
	ssPassword: string
	description: string | null
	tag: string | null
	telegramId: string | null
	email: string | null
	hwidDeviceLimit: string | null
	firstConnectedAt: string | null
	lastTriggeredThreshold: number
	createdAt: string
	updatedAt: string
	activeInternalSquads: ActiveInternalSquad[]
	subscriptionUrl: string
	lastConnectedNode: LastConnectedNode
	happ: {
		cryptoLink: string
	}
}

type TrafficLimitStrategy = 'NO_RESET' | 'DAY ' | 'WEEK ' | 'MONTH '
interface ActiveInternalSquad {
	uuid: string
	name: string
}

interface LastConnectedNode {
	connectedAt: string
	nodeName: string
	countryCode: string
}

export type UpdateUserParams = Partial<CreateUserParams> & { uuid: string }
export interface ResponseUsers {
	users: ResponseUser[]
}

export type UserUUID = string
export type GetUserByKeys = keyof Pick<
	ResponseUser,
	'username' | 'telegramId' | 'email' | 'uuid' | 'tag'
>
