import { nodeEslintConfig } from '@repo/eslint-config'
import drizzle from 'eslint-plugin-drizzle'

export default nodeEslintConfig.append({
	plugins: {
		drizzle,
	},
})
