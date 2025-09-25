import { bold, code, format, italic } from 'gramio'

export const subscriptionMessage = (arg: {
	title?: string
	location: string
	protocol: string
	endDate: string
	subUrl: string
}) => format`${arg.title ?? ''}\n
	Локация: ${bold(arg.location)}
	Протокол: ${bold(arg.protocol)}
	Срок действия до: ${bold(arg.endDate)}\n
	${italic`Ключ доступа (клик, чтобы скопировать):`}
	${code(arg.subUrl)}`
