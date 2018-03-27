const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

/**
 * Creates a new Staff.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Staff}
 * @api public
 */

var Staff = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Staff.prototype._setXML = function(method, fn) {
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for staff.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'staff.current':
		case 'staff.list':
			break

		case 'staff.get':
			request.appendChild(xml.createElement('staff_id')).textContent = this.staff_id
			break
	}

	fn(xml)
}

/**
 * Sets Staff properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Staff.prototype._getXML = function(xml, fn) {
	var nodes = (select('//xmlns:staff', xml)[0] || select('//xmlns:member', xml)[0]).childNodes

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].nodeName !== '#text') {
			switch (nodes[x].nodeName) {
				default:
					this[nodes[x].nodeName] = (nodes[x].nodeValue || nodes[x].value || nodes[x].textContent)
					break
			}
		}
	}
	fn()
}

/**
 * Gets Current Staff Member
 *
 * @param {Number} id
 * @param {Function} fn
 * @api public
 */

Staff.prototype.current = function(fn) {

	this._setXML('staff.current', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET CURRENT STAFF: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
			}
		})
	})
}

/**
 * Gets a Staff Member.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Staff.prototype.get = function(fn) {
	var self = this
	if (typeof arguments[1] === 'function') {
		this.staff_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('staff.get', xml => {
		self.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET STAFF: ' + err))
			} else {
				self._getXML(xml, () => fn(null, self))
			}
		})
	})
}

/**
 * List Staff.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Staff.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('staff.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err !== null) {
				fn(err)
			} else if (
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST STAFF: ' + err))
			} else {
				var members = select('//xmlns:staff_members', xml)
				var options = {
					page: select('string(/@page)', members),
					per_page: select('string(/@per_page)', members),
					pages: select('string(/@pages)', members),
					total: select('string(/@total)', members),
				}
				members = []

				select('//xmlns:member', xml).forEach(a => {
					var member = new this.freshbooks.Staff()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					member._getXML(xml, () => {members.push(member)})
				})

				fn(null, members, options)
			}
		})
	})
}
