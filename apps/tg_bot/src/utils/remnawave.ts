import { Remnawave } from '@repo/remnawave'

import { config } from '@/config'

export const remnawave = new Remnawave(config.REMNAWAVE_API_URL, config.REMNAWAVE_API_KEY)
