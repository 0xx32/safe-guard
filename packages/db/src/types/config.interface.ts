export interface Config {
	paymentMethods: PaymentMethod[]
	subscriptions: SubscriptionVariant[]
	locations: Location[]
}

interface Location {
	key: string
	name: string
	icon: string
}

export interface PaymentMethod {
	name: string
	key: string
}

export interface SubscriptionVariant {
	price: number
	duration: {
		value: number
		label: string
	}
}
