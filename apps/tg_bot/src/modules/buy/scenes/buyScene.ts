import type { User } from '@repo/db/schemes'

import { Scene } from '@gramio/scenes'
import { getConfig } from '@repo/db/helpers'
import { usersTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { bold, format, InlineKeyboard } from 'gramio'

import { db } from '@/db/client'

interface BuySceneParams {
	user: User
}

interface Period {
	key: string
	label: string
	price: number
	enabled: boolean
}
const PERIODS = [
	{
		key: '1 месяц',
		label: '1 месяц',
		price: 79,
		enabled: true,
	},
]

const PROTOCOLS = ['vless']

export const buyScene = new Scene('buy')
	.params<BuySceneParams>()
	.step('callback_query', async (ctx) => {
		const config = await getConfig('main', db)

		if (!config) {
			await ctx.send('Не удалось получить конфигурацию')
			return ctx.scene.exit()
		}
		const locations = config.locations

		if (!locations || locations.length === 0) {
			await ctx.send('Не найдено локаций')
			return ctx.scene.exit()
		}

		if (ctx.scene.step.firstTime) {
			return ctx.editText('Выберите локацию', {
				reply_markup: new InlineKeyboard().add(
					...locations.map((location) =>
						InlineKeyboard.text(
							`${location.icon} ${location.name}`,
							location.key
						)
					)
				),
			})
		}

		if (!locations.some((location) => location.key === ctx.queryPayload)) return

		await ctx.answerCallbackQuery()

		return ctx.scene.update({
			location: locations.find((x) => x.key === ctx.queryPayload)!,
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
		if (ctx.scene.step.firstTime) {
			return ctx.editText('Выберите период', {
				reply_markup: new InlineKeyboard()
					.columns(2)
					.add(
						...PERIODS.filter((x) => x.enabled).map((x) =>
							InlineKeyboard.text(`${x.label} / ${x.price} рублей`, x.key)
						)
					),
			})
		}

		if (!PERIODS.some((period) => period.key === ctx.queryPayload)) return

		await ctx.answerCallbackQuery()

		return ctx.scene.update({
			period: PERIODS.find((x) => x.key === ctx.queryPayload) as Period,
		})
	})
	.step('callback_query', async (ctx) => {
		if (ctx.scene.params.user.balance < ctx.scene.state.period.price) {
			await ctx.editText('Недостаточно средств', {
				reply_markup: new InlineKeyboard().text('Перейти в профиль', 'profile'),
			})

			return ctx.scene.exit()
		}

		await ctx.send(
			format`${bold`Период`}: ${ctx.scene.state.period.label}
            ${bold`Локация`}: ${ctx.scene.state.location.name}
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
			.update(usersTable)
			.set({
				balance: ctx.scene.params.user.balance - ctx.scene.state.period.price,
			})
			.where(eq(usersTable.id, ctx.scene.params.user.id))

		await ctx.editText('Ваша подписка активирована')
		return ctx.scene.exit()
	})
