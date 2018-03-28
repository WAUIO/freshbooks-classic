const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Recurring.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Recurring}
 * @api public
 */

var Recurring = (module.exports = function() {
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

Recurring.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for recurring.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'recurring.create':
		case 'recurring.update':
			var recurring = request.appendChild(xml.createElement('recurring'))
			var lines = recurring.appendChild(xml.createElement('lines'))

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'folder':
						case 'staff_id':
						case 'updated':
						case 'stopped':
						case 'stopped':
						case 'recurring':
							break

						case 'autobill':
							var autobill = recurring.appendChild(xml.createElement('autobill'))
							var card = autobill.appendChild(xml.createElement('card'))
							var expiration = card.appendChild(xml.createElement('expiration'))

							autobill.appendChild(xml.createElement('gateway_name')).textContent = this.autobill.gateway_name
							card.appendChild(xml.createElement('number')).textContent = this.autobill.card.number
							card.appendChild(xml.createElement('name')).textContent = this.autobill.card.name
							expiration.appendChild(xml.createElement('month')).textContent = this.autobill.card.expiration.month
							expiration.appendChild(xml.createElement('year')).textContent = this.autobill.card.expiration.year
							break

						case 'lines':
							if (this.lines.length > 0) {
								this.lines.forEach(a => {
									var line = lines.appendChild(xml.createElement('line'))

									for (var key in a) {
										line.appendChild(xml.createElement(key)).textContent = a[key]
									}
								})
							}
							break

						case 'contact_id':
							recurring
								.appendChild(xml.createElement('contacts'))
								.appendChild(xml.createElement('contact'))
								.appendChild(xml.createElement('contact_id'))
								.textContent = this[key]
							break

						default:
							recurring.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'recurring.get':
		case 'recurring.sendBySnailMail':
		case 'recurring.sendByEmail':
		case 'recurring.delete':
			request.appendChild(xml.createElement('recurring_id')).textContent = this.recurring_id
			break

		case 'recurring.list':
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
 * Sets Recurring properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Recurring.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:recurring', xml)

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].nodeName !== '#text') {
			switch (nodes[x].nodeName) {
				case 'estimate_id':
					break

				case 'contacts':
					this.contact_id = select('string(//xmlns:contact_id)', xml)
					break

				case 'autobill':

					if (select('string(//xmlns:gateway_name)', xml)) {
						this.autobill = {}
						this.autobill.card = {}
						this.autobill.card.expiration = {}
						this.autobill.gateway_name = select('string(//xmlns:gateway_name)', xml)
						this.autobill.card.number = select('string(//xmlns:number)', xml)
						this.autobill.card.name = select('string(//xmlns:name)', xml)
						this.autobill.card.expiration.month = select('string(//xmlns:month)', xml)
						this.autobill.card.expiration.year = select('string(//xmlns:year)', xml)
					}
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
					this[nodes[x].nodeName] = (nodes[x].nodeValue || nodes[x].value)
					break
			}
		}
	}
	fn()
}

/**
 * Creates an Recurring.
 *
 * @param {Function} fn
 * @api public
 */

Recurring.prototype.create = function(fn) {

	this._setXML('recurring.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE RECURRING: ' + err))
			} else {
				this.recurring_id = select('string(//xmlns:recurring_id)', xml)
				this.get(this.recurring_id, fn)
			}
		})
	})
}

/**
 * Updates an Recurring.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Recurring.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.recurring_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('recurring.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT UPDATE RECURRING: ' + err))
			} else {
				this.get(this.recurring_id, fn)
			}
		})
	})
}

/**
 * Gets an Recurring.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Recurring.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.recurring_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('recurring.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET RECURRING: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
			}
		})
	})
}

/**
 * Deletes an Recurring.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Recurring.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.recurring_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('recurring.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT DELETE RECURRING: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Recurrings.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Recurring.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('recurring.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST RECURRINGS: ' + err))
			} else {
				var recurrings = select('//xmlns:recurrings', xml)
				var options = {
					page: select('string(/@page)', recurrings),
					per_page: select('string(/@per_page)', recurrings),
					pages: select('string(/@pages)', recurrings),
					total: select('string(/@total)', recurrings),
				}
				recurrings = []

				select('//xmlns:recurring', xml).forEach(a => {
					var recurring = new this.freshbooks.Recurring()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					recurring._getXML(xml, () => {recurrings.push(recurring)})
				})

				fn(null, recurrings, options)
			}
		})
	})
}
