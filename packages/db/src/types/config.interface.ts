export interface Config {
	paymentMethods: PaymentMethod[]
	locations: Location[]
	periods: Periods
	protocols: Record<number, string>
}
export interface PaymentMethod {
	name: string
	key: string
}

export interface Location {
	id: number
	symbol: string
	name: string
	icon: string
	supplementToPrice: number
}

type Periods = Record<
	number,
	{
		title: string
		price: number
	}
>
