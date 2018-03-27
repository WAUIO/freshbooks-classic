var libxml = require('libxmljs')

/**
 * Creates a new Time Entry.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Time Entry}
 * @api public
 */

var Time_Entry = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Time_Entry.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for time_entry.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'time_entry.create':
		case 'time_entry.update':
			var time_entry = request.node('time_entry')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'billed':
							break

						default:
							time_entry.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'time_entry.get':
		case 'time_entry.delete':
			request.node('time_entry_id').text(this.time_entry_id)
			break

		case 'time_entry.list':
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
 * Sets Time Entry properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Time_Entry.prototype._getXML = function(xml, fn) {
	var nodes = xml.get('//xmlns:time_entry', this.freshbooks.ns).childNodes()

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
 * Creates an Time Entry.
 *
 * @param {Function} fn
 * @api public
 */

Time_Entry.prototype.create = function(fn) {

	this._setXML('time_entry.create', xml => {
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
				fn(new Error('CANNOT CREATE TIME ENTRY: ' + err))
			} else {
				this.time_entry_id = xml.get('//xmlns:time_entry_id', this.freshbooks.ns).text()
				this.get(this.time_entry_id, fn)
			}
		})
	})
}

/**
 * Updates an Time Entry.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Time_Entry.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.time_entry_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.update', xml => {
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
				fn(new Error('CANNOT UPDATE TIME ENTRY: ' + err))
			} else {
				this.get(this.time_entry_id, fn)
			}
		})
	})
}

/**
 * Gets an Time Entry.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Time_Entry.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.time_entry_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.get', xml => {
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
				fn(new Error('CANNOT GET TIME ENTRY: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
			}
		})
	})
}

/**
 * Deletes an Time Entry.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Time_Entry.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.time_entry_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.delete', xml => {
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
				fn(new Error('CANNOT DELETE TIME ENTRY: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Time Entrys.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Time_Entry.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.list', options, xml => {
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
				fn(new Error('CANNOT LIST TIME ENTRYS: ' + err))
			} else {
				var time_entries = xml.get('//xmlns:time_entries', this.freshbooks.ns)
				var options = {
					page: time_entries.attr('page').value(),
					per_page: time_entries.attr('per_page').value(),
					pages: time_entries.attr('pages').value(),
					total: time_entries.attr('total').value(),
				}
				time_entries = []

				xml.find('//xmlns:time_entry', this.freshbooks.ns).forEach(a => {
					var time_entry = new this.freshbooks.Time_Entry()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					time_entry._getXML(xml, () => {
						time_entries.push(time_entry)
					})
				})

				fn(null, time_entries, options)
			}
		})
	})
}
