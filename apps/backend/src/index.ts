import { Hono } from 'hono'

import { config } from './config'
import { lolzPay } from './features/webhooks/lolz-pay'

const app = new Hono().basePath('/api')

app.route('/lolz', lolzPay)

app.get('/', (c) => {
	return c.text('Hello Hono!')
})

export default {
	fetch: app.fetch,
	port: config.PORT,
}
