export interface BaseResponse<Data> {
	response: Data
}
export interface RemnawaveError {
	path: string
	message: string
	errorCode: string
	timestamp: string
}
