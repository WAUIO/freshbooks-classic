const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Time Entry.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Time Entry}
 * @api public
 */

var TimeEntry = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

TimeEntry.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for time_entry.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'time_entry.create':
		case 'time_entry.update':
			var time_entry = request.appendChild(xml.createElement('time_entry'))

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'billed':
						case 'time_entry':
							break

						default:
							time_entry.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'time_entry.get':
		case 'time_entry.delete':
			request.appendChild(xml.createElement('time_entry_id')).textContent = this.time_entry_id
			break

		case 'time_entry.list':
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
 * Sets Time Entry properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

TimeEntry.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:time_entry', xml)

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
 * Creates an Time Entry.
 *
 * @param {Function} fn
 * @api public
 */

TimeEntry.prototype.create = function(fn) {

	this._setXML('time_entry.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE TIME ENTRY: ' + err))
			} else {
				this.time_entry_id = select('string(//xmlns:time_entry_id)', xml)
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

TimeEntry.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.time_entry_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.update', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
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

TimeEntry.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.time_entry_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.get', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET TIME ENTRY: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
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

TimeEntry.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.time_entry_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('time_entry.delete', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
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

TimeEntry.prototype.list = function(fn) {
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST TIME ENTRYS: ' + err))
			} else {
				var time_entries = select('//xmlns:time_entries', xml)
				var options = {
					page: select('string(/@page)', time_entries),
					per_page: select('string(/@per_page)', time_entries),
					pages: select('string(/@pages)', time_entries),
					total: select('string(/@total)', time_entries),
				}
				time_entries = []

				select('//xmlns:time_entry', xml).forEach(a => {
					var time_entry = new this.freshbooks.TimeEntry()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					time_entry._getXML(xml, () => {time_entries.push(time_entry)})
				})

				fn(null, time_entries, options)
			}
		})
	})
}
