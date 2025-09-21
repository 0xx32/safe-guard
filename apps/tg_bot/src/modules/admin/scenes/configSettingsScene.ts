import { Scene } from '@gramio/scenes'
import { configTable } from '@repo/db/schemes'
import { eq } from 'drizzle-orm'
import { format, InlineKeyboard, pre } from 'gramio'

import { db } from '@/db/client'

export const configSettingsScene = new Scene('configSettingsScene')
	.step('callback_query', async (ctx) => {
		if (ctx.scene.step.firstTime) {
			return ctx.editText('Настройки конфига', {
				reply_markup: new InlineKeyboard().text(
					'Обновить конфигурацию',
					'update-config'
				),
			})
		}

		if (ctx.queryPayload !== 'update-config') return

		return ctx.scene.step.next()
	})
	.step(['message', 'callback_query'], async (ctx) => {
		const configList = await db
			.select()
			.from(configTable)
			.where(eq(configTable.id, 2))
		const config = configList.at(0)?.values

		if (!config) {
			await ctx.send('Не удалось получить конфигурацию')
			return ctx.scene.exit()
		}

		if (ctx.scene.step.firstTime) {
			await ctx.editText(
				format`Вставьте новый конфиг ${pre(JSON.stringify(config), 'js')}`,
				{
					reply_markup: new InlineKeyboard().text('Отмена', 'cancel'),
				}
			)
			await ctx.send(JSON.stringify(config))
		}

		if (ctx.is('callback_query') && ctx.queryPayload === 'cancel') {
			return ctx.scene.exit()
		}

		if (ctx.is('callback_query') || !ctx.text) return

		try {
			const newConfig = JSON.parse(ctx.text)

			await db
				.update(configTable)
				.set({
					values: newConfig,
				})
				.where(eq(configTable.id, 2))

			await ctx.send('Конфиг обновлен')
			return ctx.scene.exit()
		} catch (error) {
			console.log(error)
			return ctx.send('Конфиг не валиден')
		}
	})
