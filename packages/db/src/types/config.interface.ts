export interface Config {
	paymentMethods: PaymentMethod[]
	protocols: Record<number, string>
	periods: Periods
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

type Periods = Record<
	number,
	{
		title: string
		price: number
		duration: number
	}
>
