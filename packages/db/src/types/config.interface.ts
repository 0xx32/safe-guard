export interface Config {
	paymentMethods: PaymentMethod[]
	shopName: string
	// trial: Trial
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
