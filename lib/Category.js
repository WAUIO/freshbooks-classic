const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

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
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	switch (method) {
		case 'category.create':
		case 'category.update':
			var category = request.appendChild(xml.createElement('category'))
			for (var key in this) {
				if (typeof this[key] !== 'function' && typeof this[key] !== 'undefined') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'updated':
						case 'category':
							break

						default:
							category.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'category.get':
		case 'category.delete':
			request.appendChild(xml.createElement('category_id')).textContent = this.category_id
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
	var nodes = select('//xmlns:category', xml)

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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE CATEGORY: ' + err))
			} else {
				this.category_id = select('string(//xmlns:category_id)', xml)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET CATEGORY: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST CATEGORIES: ' + err))
			} else {
				var categories = select('//xmlns:categories', xml)
				var options = {
					page: select('string(/@page)', categories),
					per_page: select('string(/@per_page)', categories),
					pages: select('string(/@pages)', categories),
					total: select('string(/@total)', categories),
				}
				categories = []

				select('//xmlns:category', xml).forEach(a => {
					var category = new this.freshbooks.Category()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					category._getXML(xml, () => {categories.push(category)})
				})

				fn(null, categories, options)
			}
		})
	})
}
