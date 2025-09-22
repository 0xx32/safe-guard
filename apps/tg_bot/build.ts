import { autoload } from 'esbuild-plugin-autoload' // также поддерживается импорт по умолчанию

async function build() {
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
		//eslint-disable-next-line
	}).then(console.log)
}

build()
