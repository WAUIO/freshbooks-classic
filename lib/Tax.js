const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Tax.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Tax}
 * @api public
 */

var Tax = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Tax.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for tax.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'tax.create':
		case 'tax.update':
			var tax = request.appendChild(xml.createElement('tax'))

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'tax':
							break

						default:
							tax.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'tax.get':
		case 'tax.delete':
			request.appendChild(xml.createElement('tax_id')).textContent = this.tax_id
			break

		case 'tax.list':
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
 * Sets Tax properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Tax.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:tax', xml)

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
 * Creates an Tax.
 *
 * @param {Function} fn
 * @api public
 */

Tax.prototype.create = function(fn) {

	this._setXML('tax.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE TAX: ' + err))
			} else {
				this.tax_id = select('string(//xmlns:tax_id)', xml)
				this.get(this.tax_id, fn)
			}
		})
	})
}

/**
 * Updates an Tax.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.tax_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('tax.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT UPDATE TAX: ' + err))
			} else {
				this.get(this.tax_id, fn)
			}
		})
	})
}

/**
 * Gets an Tax.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.get = function(id, fn) {

	if (typeof arguments[1] === 'function') {
		this.tax_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('tax.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET TAX: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
			}
		})
	})
}

/**
 * Deletes an Tax.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.tax_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('tax.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT DELETE TAX: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Taxs.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('tax.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST TAXS: ' + err))
			} else {
				var taxes = select('//xmlns:taxes', xml)
				var options = {
					page: select('string(/@page)', taxes),
					per_page: select('string(/@per_page)', taxes),
					pages: select('string(/@pages)', taxes),
					total: select('string(/@total)', taxes),
				}
				taxes = []

				select('//xmlns:tax', xml).forEach(a => {
					var tax = new this.freshbooks.Tax()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					tax._getXML(xml, () => {taxes.push(tax)})
				})

				fn(null, taxes, options)
			}
		})
	})
}
