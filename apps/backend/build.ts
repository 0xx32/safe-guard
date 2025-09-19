async function build() {
	await Bun.build({
		entrypoints: ['src/index.ts'],
		target: 'bun',
		outdir: 'dist',
	}).then(console.log)
}

build()
