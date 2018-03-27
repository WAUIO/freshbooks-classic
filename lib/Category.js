var libxml = require('libxmljs')

/**
 * Creates a new Category.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Category}
 * @api public
 */

var Category = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Category.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options

	switch (method) {
		case 'category.create':
		case 'category.update':
			var category = request.node('category')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'updated':
							break

						default:
							category.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'category.get':
		case 'category.delete':
			request.node('category_id').text(this.category_id)
			break

		case 'category.list':
			break
	}

	fn(xml)
}

/**
 * Sets Category properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Category.prototype._getXML = function(xml, fn) {
	var nodes = xml.get('//xmlns:category', this.freshbooks.ns).childNodes()

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
 * Creates a Category.
 *
 * @param {Function} fn
 * @api public
 */

Category.prototype.create = function(fn) {

	this._setXML('category.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT CREATE CATEGORY: ' + err))
			} else {
				this.category_id = xml.get('//xmlns:category_id', this.freshbooks.ns).text()
				this.get(this.category_id, fn)
			}
		})
	})
}

/**
 * Updates an Category.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Category.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.category_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('category.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT UPDATE CATEGORY: ' + err))
			} else {
				this.get(this.category_id, fn)
			}
		})
	})
}

/**
 * Gets an Category.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Category.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.category_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('category.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT GET CATEGORY: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
			}
		})
	})
}

/**
 * Deletes an Category.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Category.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.category_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('category.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT DELETE CATEGORY: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Categories.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Category.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('category.list', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT LIST CATEGORIES: ' + err))
			} else {
				var categories = xml.get('//xmlns:categories', this.freshbooks.ns)
				var options = {
					page: categories.attr('page').value(),
					per_page: categories.attr('per_page').value(),
					pages: categories.attr('pages').value(),
					total: categories.attr('total').value(),
				}
				categories = []

				xml.find('//xmlns:category', this.freshbooks.ns).forEach(a => {
					var category = new this.freshbooks.Category()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					category._getXML(xml, () => {
						categories.push(category)
					})
				})

				fn(null, categories, options)
			}
		})
	})
}
