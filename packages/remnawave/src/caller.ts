import type { BaseResponse, RemnawaveError } from './types/common'

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

type CallResponse<ResponseData> =
	| {
		status: 'success';
		data: ResponseData;
		error: undefined;
		query?: RequestSearchParams;
		params?: unknown;
		url: string;
		headers: Headers;
		statusCode: number;
	}
	| {
		status: 'error';
		data: undefined;
		error: RemnawaveError;
		query?: RequestSearchParams;
		params?: unknown;
		url: string;
		headers: Headers;
		statusCode: number;
	};

export class Caller {
	private readonly config: CallerConfig

	constructor(options: CallerConfig) {
		this.config = options
	}

	async call<ResponseData>(
		endpoint: string,
		method: 'GET' | 'HEAD' | 'DELETE' | 'POST',
		options?: CallerBaseOptions
	): Promise<CallResponse<ResponseData>>

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

		try {
			const response = await fetch(url, {
				method,
				headers: {
					...this.config.defaultHeaders,
					...(headers ?? {}),
				},
				body: body && JSON.stringify(body),
			})

			const json = await response.json()

			const returningData = {
				query: searchParams,
				params: body,
				url: response.url,
				headers: response.headers,
				statusCode: response.status,
			}

			if (!response.ok) {
				return {
					...returningData,
					status: 'error',
					data: undefined,
					error: json as RemnawaveError,
				}
			}

			return {
				...returningData,
				status: 'success',
				data: (json as BaseResponse<ResponseData>).response,
				error: undefined,
			}
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(`Error parsing response data`)
			}

			if (error instanceof Error) {
				throw new Error(error.message)
			}
			throw new Error('Error')
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
