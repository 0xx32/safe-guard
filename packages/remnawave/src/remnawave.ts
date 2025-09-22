import type * as UserTypes from './types/user'

import { Caller } from './caller'

export class Remnawave {
	private readonly baseUrl: string
	private readonly apiKey: string

	readonly caller: Caller

	constructor(url: string, apiKey: string) {
		this.baseUrl = url
		this.apiKey = apiKey

		this.caller = new Caller({
			url: this.baseUrl,
			defaultHeaders: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
			},
		})
	}

	getUserBy(searchField: UserTypes.GetUserByKeys = 'uuid', searchValue: string) {
		let path = 'users'

		if (searchField === 'username') path += `/by-username`
		if (searchField === 'telegramId') path += `/by-telegram-id`
		if (searchField === 'email') path += `/by-email`
		if (searchField === 'tag') path += `/by-tag`

		path += `/${searchValue}`

		return this.caller.call<UserTypes.ResponseUser>(path, 'GET')
	}
	getUserByUUID(uuid: UserTypes.UserUUID) {
		return this.caller.call<UserTypes.ResponseUser>(`users/${uuid}`, 'GET')
	}
	getUserByUsername(username: string) {
		return this.caller.call<UserTypes.ResponseUser>(`users/by-username/${username}`, 'GET')
	}
	getUserByTelegramID(id: number) {
		return this.caller.call<UserTypes.ResponseUser>(`users/by-telegram-id/${id}`, 'GET')
	}
	getUserByTag(tag: string) {
		return this.caller.call<UserTypes.ResponseUser>(`users/by-tag/${tag}`, 'GET')
	}
	getAllUsers() {
		return this.caller.call<UserTypes.ResponseUsers>('users', 'GET')
	}
	createUser(user: UserTypes.CreateUserParams) {
		return this.caller.call<UserTypes.ResponseUser>('users', 'POST', {
			body: user,
		})
	}
	updateUser(user: UserTypes.UpdateUserParams) {
		return this.caller.call<UserTypes.ResponseUser>('users', 'PATCH', {
			body: user,
		})
	}
	deleteUser(uuid: UserTypes.UserUUID) {
		return this.caller.call<UserTypes.ResponseUser>(`users/${uuid}`, 'DELETE')
	}
	disableUser(uuid: UserTypes.UserUUID) {
		return this.caller.call<UserTypes.ResponseUser>(`users/${uuid}/actions/disable`, 'POST')
	}
	enableUser(uuid: UserTypes.UserUUID) {
		return this.caller.call<UserTypes.ResponseUser>(`users/${uuid}/actions/disable`, 'POST')
	}
	switchUserStatus(uuid: UserTypes.UserUUID, status: boolean) {
		const endpoint = status ? 'enable' : 'disable'

		return this.caller.call<UserTypes.ResponseUser>(`users/${uuid}/actions/${endpoint}`, 'POST')
	}
	resetUserTraffic(uuid: UserTypes.UserUUID) {
		return this.caller.call<UserTypes.ResponseUser>(`users/${uuid}/actions/reset-traffic`, 'POST')
	}
}
