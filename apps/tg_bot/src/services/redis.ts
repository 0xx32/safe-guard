import { redisStorage } from '@gramio/storage-redis'

import { config } from '@/config'

export const storage = redisStorage({
	host: config.REDIS_HOST,
	port: config.REDIS_PORT,
	password: config.REDIS_PASSWORD,
	username: config.REDIS_USERNAME,
})
