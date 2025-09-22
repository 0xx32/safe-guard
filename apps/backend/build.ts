async function build() {
	await Bun.build({
		entrypoints: ['src/index.ts'],
		target: 'bun',
		outdir: 'dist',

		//eslint-disable-next-line
	}).then(console.log)
}

build()
