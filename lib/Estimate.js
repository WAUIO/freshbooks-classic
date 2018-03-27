var libxml = require('libxmljs')

/**
 * Creates a new Estimate.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Estimate}
 * @api public
 */

var Estimate = (module.exports = function() {
	this.links = {}
	this.lines = []
})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Estimate.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for estimate.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'estimate.create':
		case 'estimate.update':
			var estimate = request.node('estimate')
			var lines = estimate.node('lines')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
						case 'folder':
						case 'links':
						case 'paid':
						case 'staff_id':
						case 'updated':
						case 'url':
						case 'auth_url':
							break

						case 'lines':
							if (this.lines.length > 0) {
								this.lines.forEach(a => {
									var line = lines.node('line')

									for (var key in a) {
										line.node(key).text(a[key])
									}
								})
							}
							break

						case 'contact_id':
							estimate
								.node('contacts')
								.node('contact')
								.node('contact_id')
								.text(this[key])
							break

						default:
							estimate.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'estimate.get':
		case 'estimate.delete':
			request.node('estimate_id').text(this.estimate_id)
			break

		case 'estimate.sendByEmail':
			request.node('estimate_id').text(this.estimate_id)

			if (options !== null) {
				for (var key in options) {
					if (typeof options[key] !== 'function') {
						request.node(key).text(options[key])
					}
				}
			}
			break

		case 'estimate.list':
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
 * Sets Estimate properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Estimate.prototype._getXML = function(xml, fn) {
	var nodes = xml.get('//xmlns:estimate', this.freshbooks.ns).childNodes()

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].name() !== 'text') {
			switch (nodes[x].name()) {
				case 'invoice_id':
					break

				case 'contacts':
					this.contact_id = xml.get('//xmlns:contact_id', this.freshbooks.ns).text()
					break

				case 'links':
					this.links.client_view = xml.get('//xmlns:client_view', this.freshbooks.ns).text()
					this.links.view = xml.get('//xmlns:view', this.freshbooks.ns).text()
					break

				case 'lines':
					xml.find('//xmlns:line', this.freshbooks.ns).forEach(a => {
						var line = {}
						var a = a.childNodes()

						for (var y = 0; y < a.length; y++) {
							if (a[y].name() !== 'text') {
								line[a[y].name()] = a[y].text()
							}
						}
						this.lines.push(line)
					})
					break

				default:
					this[nodes[x].name()] = nodes[x].text()
					break
			}
		}
	}
	fn()
}

/**
 * Creates an Estimate.
 *
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.create = function(fn) {

	this._setXML('estimate.create', xml => {
		this.freshbooks._get(xml, (err, xml) => {
			/* TODO Do we need null !== here */

			if (err !== null) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT CREATE ESTIMATE: ' + err))
			} else {
				this.estimate_id = xml.get('//xmlns:estimate_id', this.freshbooks.ns).text()
				this.get(this.estimate_id, fn)
			}
		})
	})
}

/**
 * Updates an Estimate.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.estimate_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.update', xml => {
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
				fn(new Error('CANNOT UPDATE ESTIMATE: ' + err))
			} else {
				this.get(this.estimate_id, fn)
			}
		})
	})
}

/**
 * Gets an Estimate.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.estimate_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.get', xml => {
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
				fn(new Error('CANNOT GET ESTIMATE: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
			}
		})
	})
}

/**
 * Deletes an Estimate.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.estimate_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.delete', xml => {
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
				fn(new Error('CANNOT DELETE ESTIMATE: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Estimates.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('estimate.list', options, xml => {
		this.freshbooks._get(xml, (err, xml) => {
			if (err) {
				fn(err)
			} else if (
				xml
					.get('//xmlns:response', this.freshbooks.ns)
					.attr('status')
					.value() !== 'ok'
			) {
				err = xml.get('//xmlns:error', this.freshbooks.ns).text()
				fn(new Error('CANNOT LIST ESTIMATES: ' + err))
			} else {
				var estimates = xml.get('//xmlns:estimates', this.freshbooks.ns)
				var options = {
					page: estimates.attr('page').value(),
					per_page: estimates.attr('per_page').value(),
					pages: estimates.attr('pages').value(),
					total: estimates.attr('total').value(),
				}
				var estimates = []

				xml.find('//xmlns:estimate', this.freshbooks.ns).forEach(a => {
					var estimate = new this.freshbooks.Estimate()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					estimate._getXML(xml, () => {
						estimates.push(estimate)
					})
				})

				fn(null, estimates, options)
			}
		})
	})
}

/**
 * Send Estimate by email.
 *
 * @param {Function} fn
 * @api public
 */

Estimate.prototype.sendByEmail = function(fn) {
	var options = []

	switch (typeof arguments[0]) {
		case 'object':
			options = arguments[0]
			fn = arguments[1]

			this.invoice_id = options.invoice_id || this.invoice_id
			break

		case 'number':
			this.invoice_id = arguments[0]
			break
	}

	this._setXML('estimate.sendByEmail', options, xml => {
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
				fn(new Error('CANNOT SEND ESTIMATE BY EMAIL: ' + err))
			} else {
				fn(null, this)
			}
		})
	})
}
