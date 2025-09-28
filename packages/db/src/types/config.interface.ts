export interface Config {
	paymentMethods: PaymentMethod[]
	shopName: string
	trialDurationDays: number
}
export interface PaymentMethod {
	name: string
	key: string
	enabled: boolean
}

// export interface Trial {
// 	duration: number //in days
// 	deviceLimit?: number
// 	trafficLimit?: number
// }
