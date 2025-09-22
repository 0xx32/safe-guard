import type { BaseResponse } from './types/common'

type RequestMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT'
interface RequestSearchParams {
	[key: string]: boolean | number | string | number[] | string[] | null | undefined
}

interface CallerBaseOptions {
	headers?: Record<string, string>
	search?: RequestSearchParams
}

interface CallerConfig {
	url: string
	defaultHeaders?: Record<string, string>
}

interface CallResponse<ResponseData> {
	data: ResponseData
	query?: RequestSearchParams
	params?: unknown
	url: string
	headers: Headers
	status: number
}

const STATUS_CODES = {
	SERVER_ERROR: 500,
}

export class Caller {
	private readonly config: CallerConfig

	constructor(options: CallerConfig) {
		this.config = options
	}

	// Перегрузка для GET: третий аргумент — search
	async call<ResponseData>(
		endpoint: string,
		method: 'GET' | 'HEAD' | 'DELETE' | 'POST',
		options?: CallerBaseOptions
	): Promise<CallResponse<ResponseData>>

	// Перегрузка для POST/PATCH: третий аргумент — body, четвёртый — search
	async call<ResponseData, Body = unknown>(
		endpoint: string,
		method: 'POST' | 'PATCH' | 'PUT',
		body: Body,
		options?: CallerBaseOptions
	): Promise<CallResponse<ResponseData>>

	async call<ResponseData, Body = unknown>(
		endpoint: string,
		method: RequestMethod,
		bodyOrOptions: Body | CallerBaseOptions,
		options?: CallerBaseOptions
	): Promise<CallResponse<ResponseData>> {
		let searchParams: RequestSearchParams | undefined
		let body: Body | undefined
		let headers: Record<string, string> | undefined

		if (method === 'GET' || method === 'HEAD') {
			const opts = bodyOrOptions as CallerBaseOptions | undefined
			searchParams = opts?.search
			headers = opts?.headers
			body = undefined
		} else {
			body = bodyOrOptions as Body | undefined
			searchParams = options?.search
			headers = options?.headers
		}

		const url = this.buildUrl(endpoint, searchParams)

		const response = await fetch(url, {
			method,
			headers: {
				...this.config.defaultHeaders,
				...(headers ?? {}),
			},
			body: body && JSON.stringify(body),
		})

		if (response.status === STATUS_CODES.SERVER_ERROR) {
			throw new Error(`Server error: ${response.status}: ${response.statusText}`)
		}

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}: ${response.statusText}`)
		}

		try {
			const data = (await response.json()) as BaseResponse<ResponseData>

			return {
				data: data.response,
				query: searchParams,
				params: body,
				url: response.url,
				headers: response.headers,
				status: response.status,
			}
		} catch (error) {
			if (error instanceof TypeError) {
				throw new Error(`Failed to parse response JSON: ${error.message}`)
			}
			throw error
		}
	}

	private buildUrl(endpoint: string, search?: RequestSearchParams): string {
		let url = `${this.config.url.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
		if (search) {
			const searchString = this.createSearchParams(search)
			if (searchString) {
				url += searchString
			}
		}
		return url
	}

	private createSearchParams(query: RequestSearchParams): string {
		const searchParams = new URLSearchParams()
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined || value === null) continue
			if (Array.isArray(value)) {
				value.forEach((currentValue) => searchParams.append(key, String(currentValue)))
			} else {
				searchParams.set(key, String(value))
			}
		}
		const result = searchParams.toString()
		return result ? `?${result}` : ''
	}
}
