const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Estimate.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Estimate}
 * @api public
 */

var Estimate = (module.exports = function() {
	this.links = {}
	this.lines = []
})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Estimate.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for estimate.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'estimate.create':
		case 'estimate.update':

			var estimate = request.appendChild(xml.createElement('estimate'))
			var lines = estimate.appendChild(xml.createElement('lines'))

			for (var key in this) {
				if (typeof this[key] !== 'function' && typeof this[key] !== 'undefined') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'folder':
						case 'links':
						case 'paid':
						case 'staff_id':
						case 'updated':
						case 'url':
						case 'auth_url':
						case 'estimate':
							break

						case 'lines':
							if (this.lines.length > 0) {
								this.lines.forEach(a => {
									var line = lines.appendChild(xml.createElement('line'))
									for (var key in a){
										line.appendChild(xml.createElement(key)).textContent = a[key]
									}
								})
							}
							break

						case 'contact_id':
							estimate
								.appendChild(xml.createElement('contacts'))
								.appendChild(xml.createElement('contact'))
								.appendChild(xml.createElement('contact_id'))
								.textContent = this[key]
							break

						default:
							estimate
								.appendChild(xml.createElement(key))
								.textContent = this[key]
							break
					}
				}
			}
			break

		case 'estimate.get':
		case 'estimate.delete':
			request.appendChild(xml.createElement('estimate_id')).textContent = this.estimate_id
			break

		case 'estimate.sendByEmail':
			request.appendChild(xml.createElement('estimate_id')).textContent = this.estimate_id

			if (options !== null) {
				for (var key in options) {
					if (typeof options[key] !== 'function' && typeof options[key] !== 'undefined') {
						request.appendChild(xml.createElement(key)).textContent = options[key]
					}
				}
			}
			break

		case 'estimate.list':
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
 * Sets Estimate properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Estimate.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:estimate', xml)

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].nodeName !== '#text') {
			switch (nodes[x].nodeName) {
				case 'invoice_id':
					break

				case 'contacts':
					this.contact_id = select('//xmlns:contact_id', xml).textContent
					break

				case 'links':
					this.links.client_view = select('//xmlns:client_view', xml).textContent
					this.links.view = select('//xmlns:view', xml).textContent
					break

				case 'lines':
					select('//xmlns:line', xml).forEach(a => {
						var line = {}
						var a = a.childNodes
						for (var y = 0; y < a.length; y++) {
							if (a[y].nodeName !== '#text') {
								line.setAttribute(a[y].nodeName, (a[y].nodeValue || a[y].value))
							}
						}
						this.lines.push(line)
					})
					break

				default:
					this[nodes[x].nodeName] = nodes[x].textContent
					break
			}
		}
	}
	fn()
}

/**
 * Creates an Estimate.
 *
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.create = function(fn) {

	this._setXML('estimate.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			/* TODO Do we need null !== here */

			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE ESTIMATE: ' + err))
			} else {
				this.estimate_id = select('string(//xmlns:estimate_id)', xml)
				this.get(this.estimate_id, fn)
			}
		})
	})
}

/**
 * Updates an Estimate.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.estimate_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
					select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT UPDATE ESTIMATE: ' + err))
			} else {
				this.get(this.estimate_id, fn)
			}
		})
	})
}

/**
 * Gets an Estimate.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.estimate_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
					select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET ESTIMATE: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
			}
		})
	})
}

/**
 * Deletes an Estimate.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.estimate_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
					select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT DELETE ESTIMATE: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Estimates.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err) {
				fn(err)
			} else if (
					select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST ESTIMATES: ' + err))
			} else {
				var estimates = select('//xmlns:estimates', xml)
				var options = {
					page: select('string(/@page)', estimates),
					per_page: select('string(/@per_page)', estimates),
					pages: select('string(/@pages)', estimates),
					total: select('string(/@total)', estimates),
				}
				var estimates = []

				select('//xmlns:estimate', xml).forEach(a => {
					var estimate = new this.freshbooks.Estimate()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					estimate._getXML(xml, () => {estimates.push(estimate)})
				})

				fn(null, estimates, options)
			}
		})
	})
}

/**
 * Send Estimate by email.
 *
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.sendByEmail = function(fn) {
	var options = []

	switch (typeof arguments[0]) {
		case 'object':
			options = arguments[0]
			fn = arguments[1]

			this.invoice_id = options.invoice_id || this.invoice_id
			break

		case 'number':
			this.invoice_id = arguments[0]
			break
	}

	this._setXML('estimate.sendByEmail', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
					select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT SEND ESTIMATE BY EMAIL: ' + err))
			} else {
				fn(null, this)
			}
		})
	})
}
