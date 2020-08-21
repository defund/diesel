const getModuleWithMethod = (method) => webpackJsonp
	.push([0,{a:(m,e,{c})=>e.x=Object.values(c)},['a']]).x
	.find(s=>s.exports?.default?.[method]).exports.default

window.onload = () => {
	const banner = '#diesel'
	const encodeRegex = /<(a?:\w+:)(\d+)>/g
	const decodeRegex = /<(a?:\w+:)(\d+)#diesel>/g

	const channelModule = getModuleWithMethod('getChannel')
	const customEmojiModule = getModuleWithMethod('getCustomEmojiById')
	const dispatchModule = getModuleWithMethod('dispatch')
	const emojiModule = getModuleWithMethod('isEmojiDisabled')
	const messageModule = getModuleWithMethod('sendMessage')
	const userModule = getModuleWithMethod('getCurrentUser')

	const dispatch = dispatchModule.dispatch
	const sendMessage = messageModule.sendMessage
	const getCurrentUser = userModule.getCurrentUser

	var dieselToggle = false;
	var dieselUser;

	userModule.__proto__.getCurrentUser = function() {
		const user = getCurrentUser.apply(this, arguments)
		if (dieselToggle) {
			dieselToggle = false;
			return user;
		}
		if (!dieselUser) {
			dieselUser = Object.create(Object.getPrototypeOf(user))
		}
		Object.assign(dieselUser, user)
		dieselUser.premiumType = 2
		return dieselUser
	}

	const decodeMessage = (message) => {
		if (typeof message?.content == 'string') {
			message.content = message.content
				.replace(decodeRegex, (_, name, id) => `<${name}${id}>`)
		}
	}

	dispatchModule.__proto__.dispatch = function() {
		const event = arguments[0]
		if (event?.type == 'MESSAGE_CREATE') {
			decodeMessage(event.message)
		} else if (event?.type == 'LOAD_MESSAGES_SUCCESS') {
			if (event?.messages instanceof Array) {
				event.messages.forEach(decodeMessage)
			}
		} else if (event?.type == 'SEARCH_FINISH') {
			if (event?.messages instanceof Array) {
				event.messages.forEach((preview) => {
					if (preview instanceof Array) {
						preview.forEach(decodeMessage)
					}
				})
			}
		}
		return dispatch.apply(this, arguments)
	}

	messageModule.sendMessage = function() {
		const message = arguments[1]
		if (typeof message?.content == 'string') {
			const channel = channelModule.getChannel(arguments[0])
			message.content = message.content
				.replace(encodeRegex, (match, name, id) => {
					dieselToggle = true
					const emoji = customEmojiModule.getCustomEmojiById(id)
					return emojiModule.isEmojiDisabled(emoji, channel) ?
						`<${name}${id}${banner}>` : match
				})
		}
		return sendMessage.apply(this, arguments)
	}
}
