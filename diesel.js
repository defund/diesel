const getModuleWithMethod = (method) => webpackJsonp
	.push([0,{a:(m,e,{c})=>e.x=Object.values(c)},['a']]).x
	.find(s=>s.exports.default?s.exports.default[method]:null)
	.exports.default

window.onload = () => {
	const flag = '[<https://github.com/defund/diesel>]'
	const encodeRegex = /<(a?:\w+:)(\d+)>/g
	const decodeRegex = /<(a?:\w+:)(\d+)\[<https:\/\/github\.com\/defund\/diesel>\]>/g

	var dieselUser
	var dieselNozzle = true

	const channelModule = getModuleWithMethod('getChannel')
	const customEmojiModule = getModuleWithMethod('getCustomEmojiById')
	const dispatchModule = getModuleWithMethod('dispatch')
	const emojiModule = getModuleWithMethod('isEmojiDisabled')
	const messageModule = getModuleWithMethod('sendMessage')
	const userModule = getModuleWithMethod('getCurrentUser')

	const dispatch = dispatchModule.dispatch
	const sendMessage = messageModule.sendMessage
	const getCurrentUser = userModule.getCurrentUser

	const isEmojiDisabled = (emoji, channel) => {
		dieselNozzle = false
		const result = emojiModule.isEmojiDisabled(emoji, channel)
		console.log(result)
		dieselNozzle = true
		return result
	}

	const decodeMessage = (message) => {
		if (message && typeof message.content == 'string') {
			message.content = message.content
				.replace(decodeRegex, (_, name, id) => `<${name}${id}>`)
		}
	}

	userModule.__proto__.getCurrentUser = function() {
		const user = getCurrentUser.apply(this, arguments)
		if (dieselNozzle) {
			if (!dieselUser) {
				dieselUser = Object.create(Object.getPrototypeOf(user))
			}
			Object.assign(dieselUser, user)
			dieselUser.premiumType = 2
			return dieselUser
		}
		return user;
	}

	dispatchModule.__proto__.dispatch = function() {
		if (arguments[0]) {
			const event = arguments[0]
			if (event.type == 'MESSAGE_CREATE') {
				decodeMessage(event.message)
			} else if (event.type == 'LOAD_MESSAGES_SUCCESS') {
				if (event.messages instanceof Array) {
					event.messages.forEach(decodeMessage)
				}
			} else if (event.type == 'SEARCH_FINISH') {
				if (event.messages instanceof Array) {
					event.messages.forEach((preview) => {
						if (preview instanceof Array) {
							preview.forEach(decodeMessage)
						}
					})
				}
			}
		}
		return dispatch.apply(this, arguments)
	}

	messageModule.sendMessage = function() {
		if (arguments[1]) {
			const message = arguments[1]
			if (typeof message.content == 'string') {
				const channel = channelModule.getChannel(arguments[0])
				message.content = message.content
					.replace(encodeRegex, (match, name, id) => {
						const emoji = customEmojiModule.getCustomEmojiById(id)
						return isEmojiDisabled(emoji, channel) ?
							`<${name}${id}${flag}>` : match
					})
			}
		}
		return sendMessage.apply(this, arguments)
	}
}
