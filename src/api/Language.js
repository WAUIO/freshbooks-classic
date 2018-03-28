const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Language.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Language}
 * @api public
 */

var Language = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Language.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for language.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'language.list':
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
 * Sets Language properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Language.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:language', xml)

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
 * List Languages.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Language.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('language.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST LANGUAGES: ' + err))
			} else {
				var languages = select('//xmlns:languages', xml)
				var options = {
					page: select('string(/@page)', languages),
					per_page: select('string(/@per_page)', languages),
					pages: select('string(/@pages)', languages),
					total: select('string(/@total)', languages),
				}
				languages = []

				select('//xmlns:language', xml).forEach(a => {
					var language = new this.freshbooks.Language()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					language._getXML(xml, () => {languages.push(language)})
				})

				fn(null, languages, options)
			}
		})
	})
}
