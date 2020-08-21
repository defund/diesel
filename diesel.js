const getModuleWithMethod = (method) => webpackJsonp
	.push([0,{a:(m,e,{c})=>e.x=Object.values(c)},['a']]).x
	.find(s=>s.exports?.default?.[method]).exports.default

window.onload = () => {
	const banner = '#diesel'
	const encodeRegex = /<(a?:\w+:)(\d+)>/g
	const decodeRegex = /<(a?:\w+:)(\d+)#diesel>/g

	const dispatchModule = getModuleWithMethod('dispatch')
	const messageModule = getModuleWithMethod('sendMessage')

	const dispatch = dispatchModule.dispatch
	const sendMessage = messageModule.sendMessage

	const encodeMessage = (message) => {
		if (typeof message?.content == 'string' &&
			message?.invalidEmojis instanceof Array) {
			const ids = message.invalidEmojis.map((emoji) => emoji.id)
			message.invalidEmojis.length = 0
			message.content = message.content
				.replace(encodeRegex, (match, name, id) => {
					if (ids.includes(id)) {
						return `<${name}${id}${banner}>`
					}
					return match
				})
		}
	}

	const decodeMessage = (message) => {
		if (typeof message?.content == 'string') {
			console.log('[b]', message.content)
			message.content = message.content
				.replace(decodeRegex, (_, name, id) => `<${name}${id}>`)
			console.log('[q]', message.content)
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
		encodeMessage(message)
		console.log('[+]', message)
		return sendMessage.apply(this, arguments)
	}
}
