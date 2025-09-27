export const getTotalSubscriptionPrice = (
	priceInMounth: number,
	durationInDays: number,
	discount: number
) => priceInMounth * (durationInDays / 30) - discount
