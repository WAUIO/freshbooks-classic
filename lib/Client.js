const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Client.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Client}
 * @api public
 */

var Client = (module.exports = function() {
	this.links = []
	this.credits = []
})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Client.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for client.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'client.create':
		case 'client.update':
			var client = request.appendChild(xml.createElement('client'))
			var contacts = client.appendChild(xml.createElement('contacts'))

			for (var key in this) {
				if (typeof this[key] !== 'function' && typeof this[key] !== 'undefined') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'credit':
						case 'credits':
						case 'url':
						case 'auth_url':
						case 'links':
						case 'updated':
						case 'folder':
						case 'notifications': // Mismatch between API and Documentation
						case 'contacts': // Mismatch between API and Documentation
						case 'client':
							break

						default:
							client.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'client.get':
		case 'client.delete':
			request.appendChild(xml.createElement('client_id')).textContent = this.client_id
			break

		case 'client.list':
			if (options !== null) {
				for (var key in options) {
					if (typeof options[key] !== 'function' && typeof options[key] !== 'undefined') {
						request.appendChild(xml.createElement(key)).textContent = options[key]
					}
				}
			}
			break
	}

	fn(xml)
}

/**
 * Sets Client properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Client.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:client', xml)

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].nodeName !== '#text') {
			switch (nodes[x].nodeName) {
				case 'notifications': // Mismatch between API and Documentation
				case 'contacts': // Mismatch between API and Documentation
					break

				case 'links':
					this.links.client_view = select('string(//xmlns:client_view)', xml)
					this.links.view = select('string(//xmlns:view)', xml)
					this.links.statement = select('string(//xmlns:statement)', xml)
					break

				case 'credits':
					// Technically currency is an attribute not a name but haven't worked out a better way of handling this quite yet
					nodes[x].childNodes.forEach(a => {
						if (a.nodeName !== '#text') {
							this.credits[select('string(/@currency)', a)] = a.textContent
						}
					})
					break

				default:
					this[nodes[x].nodeName] = (nodes[x].nodeValue || nodes[x].value)
					break
			}
		}
	}
	fn()
}

/**
 * Creates a Client.
 *
 * @param {Function} fn
 * @api public
 */

Client.prototype.create = function(fn) {

	this._setXML('client.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err != null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE CLIENT: ' + err))
			} else {
				this.client_id = select('string(//xmlns:client_id)', xml)
				this.get(this.client_id, fn)
			}
		})
	})
}

/**
 * Updates a Client.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Client.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.client_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('client.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err != null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT UPDATE CLIENT: ' + err))
			} else {
				this.get(this.client_id, fn)
			}
		})
	})
}

/**
 * Gets a Client.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Client.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.client_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('client.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err != null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET CLIENT: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
			}
		})
	})
}

/**
 * Deletes a Client.
 *
 * @param (Number) id
 * @param {Function} fn
 * @api public
 */

Client.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.client_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('client.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err != null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT DELETE CLIENT: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Clients.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Client.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('client.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST CLIENTS: ' + err))
			} else {
				var clients = select('//xmlns:clients', xml)
				var options = {
					page: select('string(/@page)', clients),
					per_page: select('string(/@per_page)', clients),
					pages: select('string(/@pages)', clients),
					total: select('string(/@total)', clients),
				}
				clients = []

				select('//xmlns:client', xml).forEach(a => {
					var client = new this.freshbooks.Client()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					client._getXML(xml, () => {clients.push(client)})
				})

				fn(null, clients, options)
			}
		})
	})
}
