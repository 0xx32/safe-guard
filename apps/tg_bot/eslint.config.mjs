
import nodeConfig from '@repo/node-eslint-config'
import drizzle from 'eslint-plugin-drizzle'

export default nodeConfig.append({
	plugins: {
		drizzle,
	}
})