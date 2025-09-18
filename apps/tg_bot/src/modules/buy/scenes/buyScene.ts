import type { UserType } from '@repo/db/schemes'

import { Scene } from '@gramio/scenes'
import * as schemes from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, format, InlineKeyboard } from 'gramio'

import { db } from '@/db/client'
import { getConfig } from '@/utils/helpers'

interface BuySceneParams {
	user: UserType
}

interface Location {
	key: string
	label: string
	icon: string
	enabled: boolean
}
interface Period {
	key: string
	label: string
	price: number
	enabled: boolean
}
const PROTOCOLS = ['vless']

export const buyScene = new Scene('buy')
	.params<BuySceneParams>()
	.step('callback_query', async (ctx) => {
		const locationsConfig = await getConfig<{ locations: Location[] }>(
			'vpn-locations'
		)
		const locations = locationsConfig?.values.locations

		if (!locations || locations.length === 0) {
			await ctx.send('Не найдено локаций')
			return ctx.scene.exit()
		}

		if (ctx.scene.step.firstTime) {
			return ctx.editText('Выберите локацию', {
				reply_markup: new InlineKeyboard().add(
					...locations
						.filter((x) => x.enabled)
						.map((location) =>
							InlineKeyboard.text(
								`${location.icon} ${location.label}`,
								location.key
							)
						)
				),
			})
		}

		if (!locations.some((location) => location.key === ctx.queryPayload)) return

		await ctx.answerCallbackQuery()

		return ctx.scene.update({
			location: locations.find((x) => x.key === ctx.queryPayload) as Location,
		})
	})
	.step('callback_query', async (ctx) => {
		if (ctx.scene.step.firstTime) {
			return ctx.editText('Выберите протокол', {
				reply_markup: new InlineKeyboard().text('VLESS', 'vless'),
			})
		}

		if (!PROTOCOLS.includes(ctx.queryPayload as string)) {
			return
		}

		return ctx.scene.update({
			protocol: ctx.queryPayload as string,
		})
	})
	.step('callback_query', async (ctx) => {
		const subscriptionsConfig = await getConfig<{ periods: Period[] }>(
			'subscription'
		)
		const periods = subscriptionsConfig?.values.periods

		if (!periods || periods.length === 0) {
			await ctx.send('Ошибка получения периодов')
			return ctx.scene.exit()
		}

		if (ctx.scene.step.firstTime) {
			return ctx.editText('Выберите период', {
				reply_markup: new InlineKeyboard()
					.columns(2)
					.add(
						...periods
							.filter((x) => x.enabled)
							.map((x) =>
								InlineKeyboard.text(`${x.label} / ${x.price} рублей`, x.key)
							)
					),
			})
		}

		if (!periods.some((period) => period.key === ctx.queryPayload)) return

		await ctx.answerCallbackQuery()

		return ctx.scene.update({
			period: periods.find((x) => x.key === ctx.queryPayload) as Period,
		})
	})
	.step('callback_query', async (ctx) => {
		if (ctx.scene.params.user.ballance < ctx.scene.state.period.price) {
			await ctx.editText('Недостаточно средств', {
				reply_markup: new InlineKeyboard().text('Перейти в профиль', 'profile'),
			})

			return ctx.scene.exit()
		}

		await ctx.send(
			format`${bold`Период`}: ${ctx.scene.state.period.label}
            ${bold`Локация`}: ${ctx.scene.state.location.label}
            ${bold`Протокол`}: ${ctx.scene.state.protocol.toUpperCase()}
            ${bold`Цена`}: ${ctx.scene.state.period.price} рублей`,
			{
				reply_markup: new InlineKeyboard().text('💸Оплатить', 'payment'),
			}
		)
		return ctx.scene.update({})
	})
	.step('callback_query', async (ctx) => {
		if (ctx.queryPayload !== 'payment') return

		await ctx.answerCallbackQuery()

		await db
			.update(schemes.users)
			.set({
				ballance: ctx.scene.params.user.ballance - ctx.scene.state.period.price,
			})
			.where(eq(schemes.users.id, ctx.scene.params.user.id))

		await ctx.editText('Ваша подписка активирована')
		return ctx.scene.exit()
	})
