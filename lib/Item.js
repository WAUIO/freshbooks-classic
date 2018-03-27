var libxml = require('libxmljs')

/**
 * Creates a new Item.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Item}
 * @api public
 */

var Item = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Item.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for item.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'item.create':
		case 'item.update':
			var item = request.node('item')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
							break

						default:
							item.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'item.get':
		case 'item.delete':
			request.node('item_id').text(this.item_id)
			break

		case 'item.list':
			if (options !== null) {
				for (var key in options) {
					if (typeof options[key] !== 'function') {
						request.node(key).text(options[key])
					}
				}
			}
			break
	}

	fn(xml)
}

/**
 * Sets Item properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Item.prototype._getXML = function(xml, fn) {
	var nodes = xml.get('//xmlns:item', this.freshbooks.ns).childNodes()

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
 * Creates an Item.
 *
 * @param {Function} fn
 * @api public
 */

Item.prototype.create = function(fn) {

	this._setXML('item.create', xml => {
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
				fn(new Error('CANNOT CREATE ITEM: ' + err))
			} else {
				this.item_id = xml.get('//xmlns:item_id', this.freshbooks.ns).text()
				this.get(this.item_id, fn)
			}
		})
	})
}

/**
 * Updates an Item.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Item.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.item_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('item.update', xml => {
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
				fn(new Error('CANNOT UPDATE ITEM: ' + err))
			} else {
				this.get(this.item_id, fn)
			}
		})
	})
}

/**
 * Gets an Item.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Item.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.item_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('item.get', xml => {
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
				fn(new Error('CANNOT GET ITEM: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
			}
		})
	})
}

/**
 * Deletes an Item.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Item.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.item_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('item.delete', xml => {
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
				fn(new Error('CANNOT DELETE ITEM: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Items.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Item.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('item.list', options, xml => {
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
				fn(new Error('CANNOT LIST ITEMS: ' + err))
			} else {
				var items = xml.get('//xmlns:items', this.freshbooks.ns)
				var options = {
					page: items.attr('page').value(),
					per_page: items.attr('per_page').value(),
					pages: items.attr('pages').value(),
					total: items.attr('total').value(),
				}
				items = []

				xml.find('//xmlns:item', this.freshbooks.ns).forEach(a => {
					var item = new this.freshbooks.Item()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					item._getXML(xml, () => {
						items.push(item)
					})
				})

				fn(null, items, options)
			}
		})
	})
}
