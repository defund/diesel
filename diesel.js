const messages_route = /^https:\/\/discord(app)?\.com\/api\/v8\/channels\/[0-9]+\/messages$/

const nitro_emoji = /<((a)?:[a-zA-Z0-9]{2,}:[0-9]+)>/
const diesel_emoji = /<((a)?:[a-zA-Z0-9]{2,}:[0-9]+)#diesel>/

const encode = (content) => content.replace(nitro_emoji, (_, id) => `<${id}#diesel>`)
const decode = (content) => content.replace(diesel_emoji, (_, id) => `<${id}>`)

const xml_open_old = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function() {
	if (arguments[1].match(messages_route)) {
		this._diesel = true
	}
	xml_open_old.apply(this, arguments)
}

const xml_send_old = XMLHttpRequest.prototype.send
XMLHttpRequest.prototype.send = function() {
	console.log(arguments)
	if (this._diesel && typeof arguments[0] == 'string') {
		const body = JSON.parse(arguments[0])
		body.content = encode(body.content)
		arguments[0] = JSON.stringify(body)
	} else if (this._diesel && arguments[0] instanceof FormData) {
		const content = arguments[0].get('content')
		arguments[0].set('content', encode(content))
	}
	console.log('done')
	xml_send_old.apply(this, arguments)
}

const json_parse_old = JSON.parse
JSON.parse = function() {
	const object = json_parse_old.apply(this, arguments)
	if (object.t == 'MESSAGE_CREATE') {
		object.d.content = decode(object.d.content)
	} else if (object instanceof Array) {
		if (object.length > 0 && typeof object[0].content == 'string') {
			object.forEach(message => message.content = decode(message.content))
		}
	}
	return object;
}
