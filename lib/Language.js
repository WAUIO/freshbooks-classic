var libxml = require('libxmljs')

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
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options
	var self = this

	// If second argument not a function then we have been passed the 'options' for language.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'language.list':
			for (var key in options) {
				if (typeof options[key] !== 'function') {
					request.node(key).text(options[key])
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
	var self = this
	var nodes = xml.get('//xmlns:language', this.freshbooks.ns).childNodes()

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].name() !== 'text') {
			switch (nodes[x].name()) {
				default:
					this[nodes[x].name()] = nodes[x].text()
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
	var self = this
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('language.list', options, function(xml) {
		self.freshbooks._get(xml, function(err, xml) {
			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', self.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', self.freshbooks.ns).text()
				fn(new Error('CANNOT LIST LANGUAGES: ' + err))
			} else {
				var languages = xml.get('//xmlns:languages', self.freshbooks.ns)
				var options = {
					page: languages.attr('page').value(),
					per_page: languages.attr('per_page').value(),
					pages: languages.attr('pages').value(),
					total: languages.attr('total').value(),
				}
				languages = []

				xml.find('//xmlns:language', self.freshbooks.ns).forEach(function(a) {
					var language = new self.freshbooks.Language()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					language._getXML(xml, function() {
						languages.push(language)
					})
				})

				fn(null, languages, options)
			}
		})
	})
}
