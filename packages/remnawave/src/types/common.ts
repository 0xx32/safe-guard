export interface BaseResponse<Data> {
	response: Data
}
export interface ServerErrorResponse {
	path: string
	message: string
	errorCode: string
	timestamp: string
}
