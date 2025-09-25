export interface Config {
	paymentMethods: PaymentMethod[]
	locations: Record<number, Location>
	protocols: Record<number, string>
	periods: Periods
}
export interface PaymentMethod {
	name: string
	key: string
}

export interface Location {
	id: number
	code: string
	name: string
	icon: string
	supplementToPrice: number
}

type Periods = Record<
	number,
	{
		title: string
		price: number
		duration: number
	}
>
