var libxml = require('libxmljs')

/**
 * Creates a new Invoice.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Invoice}
 * @api public
 */

var Invoice = (module.exports = function() {
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

Invoice.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options
	var self = this

	// If second argument not a function then we have been passed the 'options' for invoice.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'invoice.create':
		case 'invoice.update':
			var invoice = request.node('invoice')
			var lines = invoice.node('lines')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'amount_outstanding':
						case 'freshbooks':
						case 'folder':
						case 'links':
						case 'paid':
						case 'recurring_id':
						case 'staff_id':
						case 'updated':
						case 'url':
						case 'auth_url':
						case 'estimate_id':
							break

						case 'lines':
							if (this.lines.length > 0) {
								this.lines.forEach(function(a) {
									var line = lines.node('line')

									for (var key in a) {
										if (key !== 'order') {
											line.node(key).text(a[key])
										}
									}
								})
							}
							break

						case 'contact_id':
							invoice
								.node('contacts')
								.node('contact')
								.node('contact_id')
								.text(this[key])
							break

						default:
							invoice.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'invoice.lines.add':
			request.node('invoice_id').text(self.invoice_id)
			var lines = request.node('lines')
			if (this.lines.length > 0) {
				this.lines.forEach(function(a) {
					var line = lines.node('line')
					for (var key in a) {
						line.node(key).text(a[key])
					}
				})
			}
			break

		case 'invoice.get':
		case 'invoice.sendBySnailMail':
		case 'invoice.delete':
			request.node('invoice_id').text(self.invoice_id)
			break

		case 'invoice.sendByEmail':
			request.node('invoice_id').text(self.invoice_id)

			if (options !== null) {
				for (var key in options) {
					if (typeof options[key] !== 'function') {
						request.node(key).text(options[key])
					}
				}
			}
			break

		case 'invoice.list':
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
 * Sets Invoice properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Invoice.prototype._getXML = function(xml, fn) {
	var self = this
	var nodes = xml.get('//xmlns:invoice', this.freshbooks.ns).childNodes()

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].name() !== 'text') {
			switch (nodes[x].name()) {
				case 'estimate_id':
					break

				case 'contacts':
					this.contact_id = xml.get('//xmlns:contact_id', this.freshbooks.ns).text()
					break

				case 'links':
					this.links.client_view = xml.get('//xmlns:client_view', this.freshbooks.ns).text()
					this.links.view = xml.get('//xmlns:view', this.freshbooks.ns).text()
					this.links.edit = xml.get('//xmlns:edit', this.freshbooks.ns).text()
					break

				case 'lines':
					self.lines = []
					xml.find('//xmlns:line', this.freshbooks.ns).forEach(function(a) {
						var line = {}
						var a = a.childNodes()

						for (var y = 0; y < a.length; y++) {
							if (a[y].name() !== 'text') {
								line[a[y].name()] = a[y].text()
							}
						}
						self.lines.push(line)
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
 * Creates an Invoice.
 *
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.create = function(fn) {
	var self = this

	this._setXML('invoice.create', function(xml) {
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
				fn(new Error('CANNOT CREATE INVOICE: ' + err))
			} else {
				self.invoice_id = xml.get('//xmlns:invoice_id', self.freshbooks.ns).text()
				self.get(self.invoice_id, fn)
			}
		})
	})
}

/**
 * Updates an Invoice.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.update = function(fn) {
	var self = this

	if (typeof arguments[1] === 'function') {
		this.invoice_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('invoice.update', function(xml) {
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
				fn(new Error('CANNOT UPDATE INVOICE: ' + err))
			} else {
				self.get(self.invoice_id, fn)
			}
		})
	})
}

/**
 * Gets an Invoice.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.get = function(fn) {
	var self = this

	if (typeof arguments[1] === 'function') {
		this.invoice_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('invoice.get', function(xml) {
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
				fn(new Error('CANNOT GET INVOICE: ' + err))
			} else {
				self._getXML(xml, function() {
					fn(null, self)
				})
			}
		})
	})
}

/**
 * Deletes an Invoice.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.delete = function(fn) {
	var self = this

	if (typeof arguments[1] === 'function') {
		this.invoice_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('invoice.delete', function(xml) {
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
				fn(new Error('CANNOT DELETE INVOICE: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Invoices.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.list = function(fn) {
	var self = this
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('invoice.list', options, function(xml) {
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
				fn(new Error('CANNOT LIST INVOICES: ' + err))
			} else {
				var invoices = xml.get('//xmlns:invoices', self.freshbooks.ns)
				var options = {
					page: invoices.attr('page').value(),
					per_page: invoices.attr('per_page').value(),
					pages: invoices.attr('pages').value(),
					total: invoices.attr('total').value(),
				}
				invoices = []

				xml.find('//xmlns:invoice', self.freshbooks.ns).forEach(function(a) {
					var invoice = new self.freshbooks.Invoice()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					invoice._getXML(xml, function() {
						invoices.push(invoice)
					})
				})

				fn(null, invoices, options)
			}
		})
	})
}

/**
 * Send Invoice by email.
 *
 * @param {Number} options (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.sendByEmail = function(fn) {
	var self = this
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

	this._setXML('invoice.sendByEmail', options, function(xml) {
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
				fn(new Error('CANNOT SEND INVOICE BY EMAIL: ' + err))
			} else {
				fn(null, self)
			}
		})
	})
}

/**
 * Send Invoice by mail.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.sendBySnailMail = function(id, fn) {
	var self = this

	if (typeof arguments[0] === 'function') {
		fn = arguments[0]
	} else {
		this.invoice_id = arguments[0]
	}

	this._setXML('invoice.sendBySnailMail', function(xml) {
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
				fn(new Error('CANNOT SEND INVOICE BY SNAIL MAIL: ' + err))
			} else {
				fn(null, self)
			}
		})
	})
}

/**
 * Add a line item to an existing invoice.
 *
 * @param {Number} lines Array of line items to add
 * @param {Function} fn
 * @api public
 */
Invoice.prototype.addLines = function(lines, fn) {
	var self = this

	self.lines = lines

	this._setXML('invoice.lines.add', function(xml) {
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
				fn(new Error('CANNOT ADD LINE ITEM TO INVOICE: ' + err))
			} else {
				self.get(self.invoice_id, fn)
			}
		})
	})
}
