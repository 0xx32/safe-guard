import type { Location } from '@repo/db/schemes'

import { InlineKeyboard } from 'gramio'

import { selectingLocationData } from '@/handlers/subscription'

export const locationsKeyboard = (locations: Location[]) =>
	new InlineKeyboard().columns(2).add(
		...locations.map((location) => {
			const supplementToPriceText = location.supplementToPrice
				? `(+${location.supplementToPrice}₽)`
				: ''

			return {
				text: `${location.icon} ${location.name} ${supplementToPriceText}`,
				callback_data: selectingLocationData.pack({ id: location.id }),
			}
		})
	)
