const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Payment.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Payment}
 * @api public
 */

var Payment = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Payment.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for payment.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	if (method == 'payment.create' || method == 'payment.update') {
		var payment = request.appendChild(xml.createElement('payment'))
	}

	switch (method) {
		case 'payment.create':
			if (this.client_id) {
				payment.appendChild(xml.createElement('client_id')).textContent = this.client_id
			}
			if (this.invoice_id) {
				payment.appendChild(xml.createElement('invoice_id')).textContent = this.invoice_id
			}

		case 'payment.update':
			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'updated':
						case 'from_credit':
						case 'client_id':
						case 'invoice_id':
						case 'payment':
							break

						default:
							payment.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'payment.get':
		case 'payment.delete':
			request.appendChild(xml.createElement('payment_id')).textContent = this.payment_id
			break

		case 'payment.list':
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
 * Sets Payment properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Payment.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:payment', xml)

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].nodeName !== '#text') {
			switch (nodes[x].nodeName) {
				default:
					this[nodes[x].nodeName] = (nodes[x].nodeValue || nodes[x].value)
					break
			}
		}
	}
	fn()
}

/**
 * Creates an Payment.
 *
 * @param {Function} fn
 * @api public
 */

Payment.prototype.create = function(fn) {

	this._setXML('payment.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE PAYMENT: ' + err))
			} else {
				this.payment_id = select('string(//xmlns:payment_id)', xml)
				this.get(this.payment_id, fn)
			}
		})
	})
}

/**
 * Updates an Payment.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Payment.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.payment_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('payment.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT UPDATE PAYMENT: ' + err))
			} else {
				this.get(this.payment_id, fn)
			}
		})
	})
}

/**
 * Gets an Payment.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Payment.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.payment_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('payment.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET PAYMENT: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
			}
		})
	})
}

/**
 * Deletes an Payment.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Payment.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.payment_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('payment.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT DELETE PAYMENT: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Payments.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Payment.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('payment.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST PAYMENTS: ' + err))
			} else {
				var payments = select('//xmlns:payments', xml)
				var options = {
					page: select('string(/@page)', payments),
					per_page: select('string(/@per_page)', payments),
					pages: select('string(/@pages)', payments),
					total: select('string(/@total)', payments),
				}
				payments = []

				select('//xmlns:payment', xml).forEach(a => {
					var payment = new this.freshbooks.Payment()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					payment._getXML(xml, () => {payments.push(payment)})
				})

				fn(null, payments, options)
			}
		})
	})
}
