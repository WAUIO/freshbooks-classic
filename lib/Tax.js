var libxml = require('libxmljs')

/**
 * Creates a new Tax.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Tax}
 * @api public
 */

var Tax = module.exports = function () {

}

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Tax.prototype._setXML = function (method, fn) {
  var xml = new libxml.Document()
  var request = xml.node('request').attr('method', method)
  var options
  var self = this

  // If second argument not a function then we have been passed the 'options' for tax.list
  if (typeof arguments[2] === 'function') {
    options = arguments[1]
    fn = arguments[2]
  }

  switch (method) {
    case 'tax.create':
    case 'tax.update':
      var tax = request.node('tax')

      for (var key in this) {
        if (typeof this[key] !== 'function') {
          switch (key) {
            // Catch resulting values that can't be created/updated.
            case 'freshbooks':
              break

            default:
              tax.node(key).text(this[key])
              break
          }
        }
      }
      break

    case 'tax.get':
    case 'tax.delete':
      request.node('tax_id').text(self.tax_id)
      break

    case 'tax.list':
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
 * Sets Tax properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Tax.prototype._getXML = function (xml, fn) {
  var self = this
  var nodes = xml.get('//xmlns:tax', this.freshbooks.ns).childNodes()

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
 * Creates an Tax.
 *
 * @param {Function} fn
 * @api public
 */

Tax.prototype.create = function (fn) {
  var self = this

  this._setXML('tax.create', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT CREATE TAX: ' + err))
      } else {
        self.tax_id = xml.get('//xmlns:tax_id', self.freshbooks.ns).text()
        self.get(self.tax_id, fn)
      }
    })
  })
}

/**
 * Updates an Tax.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.update = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.tax_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('tax.update', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT UPDATE TAX: ' + err))
      } else {
        self.get(self.tax_id, fn)
      }
    })
  })
}

/**
 * Gets an Tax.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.get = function (id, fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.tax_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('tax.get', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT GET TAX: ' + err))
      } else {
        self._getXML(xml, function () {
          fn(null, self)
        })
      }
    })
  })
}

/**
 * Deletes an Tax.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.delete = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.tax_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('tax.delete', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT DELETE TAX: ' + err))
      } else {
        fn()
      }
    })
  })
}

/**
 * List Taxs.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Tax.prototype.list = function (fn) {
  var self = this
  var options = []

  if (typeof arguments[1] === 'function') {
    options = arguments[0]
    fn = arguments[1]
  }

  this._setXML('tax.list', options, function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT LIST TAXS: ' + err))
      } else {
        var taxes = xml.get('//xmlns:taxes', self.freshbooks.ns)
        var options = {
          page: taxes.attr('page').value(),
          per_page: taxes.attr('per_page').value(),
          pages: taxes.attr('pages').value(),
          total: taxes.attr('total').value()
        }
        taxes = []

        xml.find('//xmlns:tax', self.freshbooks.ns).forEach(function (a) {
          var tax = new self.freshbooks.Tax()
          xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
          tax._getXML(xml, function () {
            taxes.push(tax)
          })
        })

        fn(null, taxes, options)
      }
    })
  })
}
