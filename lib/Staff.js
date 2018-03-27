var libxml = require('libxmljs')

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
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
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
			request.node('staff_id').text(this.staff_id)
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
	var nodes = (xml.get('//xmlns:staff', this.freshbooks.ns) || xml.get('//xmlns:member', this.freshbooks.ns)).childNodes()

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
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT GET CURRENT STAFF: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
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

	if (typeof arguments[1] === 'function') {
		this.staff_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('staff.get', xml => {
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
				fn(new Error('CANNOT GET STAFF: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
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
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT LIST STAFF: ' + err))
			} else {
				var members = xml.get('//xmlns:staff_members', this.freshbooks.ns)
				var options = {
					page: members.attr('page').value(),
					per_page: members.attr('per_page').value(),
					pages: members.attr('pages').value(),
					total: members.attr('total').value(),
				}
				members = []

				xml.find('//xmlns:member', this.freshbooks.ns).forEach(a => {
					var member = new this.freshbooks.Staff()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					member._getXML(xml, () => {
						members.push(member)
					})
				})

				fn(null, members, options)
			}
		})
	})
}
