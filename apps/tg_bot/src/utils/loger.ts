import { configure, getConsoleSink } from '@logtape/logtape'
import { getPrettyFormatter } from '@logtape/pretty'

const formatter = getPrettyFormatter({
	timestamp: 'date-time',
	icons: {
		info: '✨',
		error: '🔥',
		warning: '⚡',
		fatal: '💀',
		debug: '🐛',
		trace: '🔍',
	},
	colors: true,
	categoryWidth: 0,
	categoryTruncate: 'middle',
	wordWrap: true,
	properties: true,
})

export const loggerInitializer = () =>
	configure({
		sinks: {
			console: getConsoleSink({
				formatter,
			}),
		},

		loggers: [
			{ category: ['logtape', 'meta'], sinks: [] },
			{ category: 'bot', lowestLevel: 'debug', sinks: ['console'] },
			{ category: 'app', lowestLevel: 'debug', sinks: ['console'] },
			{ category: ['db', 'bot'], lowestLevel: 'debug', sinks: ['console'] },
		],
	})
