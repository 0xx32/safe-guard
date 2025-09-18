import * as schemes from '@repo/db/schemes'
import { eq } from 'drizzle-orm'

import type { BotType } from '@/bot'

import { config } from '@/config'
import { db } from '@/db/client'
import { LztPay } from '@/services/lolz-pay/client'
import { mainKeyboard } from '@/shared/keyboards'
import { START_MESSAGE } from '@/utils/constants/messages'

export default (bot: BotType) => {
	bot
		.command('start', async (ctx) => {
			await ctx.send(START_MESSAGE, {
				reply_markup: mainKeyboard,
			})

			const user = await db
				.select()
				.from(schemes.users)
				.where(eq(schemes.users.telegramID, ctx.from.id.toString()))

			if (!user.at(0)) {
				await db.insert(schemes.users).values({
					telegramID: ctx.from.id.toString(),
					tgUserName: ctx.from.username,
					uniqueID: crypto.randomUUID(),
				})
			}
		})
		.command('addConfig', async (ctx) => {
			await db.insert(schemes.configTable).values({
				key: 'subscription',
				values: {
					periods: [
						{
							label: '1 месяц',
							key: '1m',
							price: 59,
							enabled: true,
						},
						{
							label: '2 месяца',
							key: '2m',
							price: 100,
							enabled: true,
						},
						{
							label: '3 месяца',
							key: '3m',
							price: 120,
							enabled: true,
						},
					],
				},
			})

			return ctx.send('Конфиг добавлен')
		})
		.command('test', async (ctx) => {
			const lolzAPi = new LztPay()

			const invoice = await lolzAPi.createInvoice({
				params: {
					amount: 1,
					currency: 'RUB',
					payment_id: '44',
					comment: 'Test',
					url_success: 'https://google.com',
					url_callback: config.LOLZ_CALLBACK_URL,
					merchant_id: +config.LOLZ_MERCHANT_ID,
					is_test: false,
				},
			})

			console.log(invoice.data)

			ctx.send(invoice.data)
		})
}
