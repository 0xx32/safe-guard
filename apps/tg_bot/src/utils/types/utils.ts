import type { AxiosRequestConfig } from 'axios'

export type MyRequestConfig<Params = undefined> = Params extends undefined
	? { config?: AxiosRequestConfig }
	: { params: Params; config?: AxiosRequestConfig }
