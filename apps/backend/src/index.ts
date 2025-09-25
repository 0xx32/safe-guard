import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'

import { config } from './config'
import { cryptobot, lolzPay } from './features/webhooks'

const app = new Hono().basePath('/api')

app.route('/lolz', lolzPay)
app.route('/cryptobot', cryptobot)

app.get('/', (c) => {
	return c.text('Hello Hono! 2')
})

showRoutes(app, {
	verbose: true,
})

export default {
	fetch: app.fetch,
	port: config.PORT,
}
