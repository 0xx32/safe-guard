import { CallbackData } from 'gramio'

export const topupBalanceData = new CallbackData('topup_balance').number('amount')
