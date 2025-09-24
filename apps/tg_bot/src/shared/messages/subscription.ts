import { bold, code, format } from 'gramio'

export const subscriptionMessage = (arg: {
	location: string
	protocol: string
	endDate: string
	subUrl: string
}) => format`Локация: ${bold(arg.location)}
	Протокол: ${bold(arg.protocol)}
	Срок действия до: ${bold(arg.endDate)}\n
	${code(arg.subUrl)}`
