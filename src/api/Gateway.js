const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Gateway.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Gateway}
 * @api public
 */

var Gateway = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Gateway.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for gateway.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'gateway.list':
			for (var key in options) {
				if (typeof options[key] !== 'function' && typeof options[key] !== 'undefined') {
					request.appendChild(xml.createElement(key)).textContent = options[key]
				}
			}
			break
	}

	fn(xml)
}

/**
 * Sets Gateway properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Gateway.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:gateway', xml)

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
 * List Gateways.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Gateway.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('gateway.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST GATEWAYS: ' + err))
			} else {
				var gateways = select('//xmlns:gateways', xml)
				var options = {
					page: select('string(/@page)', gateways),
					per_page: select('string(/@per_page)', gateways),
					pages: select('string(/@pages)', gateways),
					total: select('string(/@total)', gateways),
				}
				gateways = []

				select('//xmlns:gateway', xml).forEach(a => {
					var gateway = new this.freshbooks.Gateway()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					gateway._getXML(xml, () => {gateways.push(gateway)})
				})

				fn(null, gateways, options)
			}
		})
	})
}
