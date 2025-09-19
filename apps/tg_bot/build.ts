// @filename: build.ts
import { autoload } from 'esbuild-plugin-autoload' // также поддерживается импорт по умолчанию

await Bun.build({
	entrypoints: ['src/index.ts'],
	target: 'bun',
	outdir: 'dist',
	plugins: [
		autoload({
			directory: './src/commands',
		}),
		autoload({
			directory: './src/handlers',
		}),
		autoload({
			directory: './src/modules',
		}),
	],
}).then(console.log)
