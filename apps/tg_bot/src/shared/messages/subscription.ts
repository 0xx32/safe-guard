import { bold, code, format, italic } from 'gramio'

export const subscriptionMessage = (arg: {
	title?: string
	uuid: string
	tariff: string
	protocol: string
	endDate: string
	subUrl: string
}) => format`${arg.title ?? ''}\n
	UUID: ${code(arg.uuid)}
	Тариф: ${bold(arg.tariff)}
	Протокол: ${bold(arg.protocol)}
	Срок действия до: ${bold(arg.endDate)}\n
	${italic`Ключ доступа (клик, чтобы скопировать):`}
	${code(arg.subUrl)}`
