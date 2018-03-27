var libxml = require('libxmljs')

/**
 * Creates a new Client.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Client}
 * @api public
 */

var Client = module.exports = function () {
  this.links = []
  this.credits = []
}

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Client.prototype._setXML = function (method, fn) {
  var xml = new libxml.Document()
  var request = xml.node('request').attr('method', method)
  var options
  var self = this

  // If second argument not a function then we have been passed the 'options' for client.list
  if (typeof arguments[2] === 'function') {
    options = arguments[1]
    fn = arguments[2]
  }

  switch (method) {
    case 'client.create':
    case 'client.update':
      var client = request.node('client')
      var contacts = client.node('contacts')

      for (var key in this) {
        if (typeof this[key] !== 'function') {
          switch (key) {
            // Catch resulting values that can't be created/updated.
            case 'freshbooks':
            case 'credit':
            case 'credits':
            case 'url':
            case 'auth_url':
            case 'links':
            case 'updated':
            case 'folder':
            case 'notifications': // Mismatch between API and Documentation
            case 'contacts': // Mismatch between API and Documentation
              break

            default:
              client.node(key).text(this[key])
              break
          }
        }
      }
      break

    case 'client.get':
    case 'client.delete':
      request.node('client_id').text(self.client_id)
      break

    case 'client.list':
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
 * Sets Client properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Client.prototype._getXML = function (xml, fn) {
  var self = this
  var nodes = xml.get('//xmlns:client', this.freshbooks.ns).childNodes()

  for (var x = 0; x < nodes.length; x++) {
    if (nodes[x].name() !== 'text') {
      switch (nodes[x].name()) {
        case 'notifications': // Mismatch between API and Documentation
        case 'contacts': // Mismatch between API and Documentation
          break

        case 'links':
          this.links.client_view = xml.get('//xmlns:client_view', this.freshbooks.ns).text()
          this.links.view = xml.get('//xmlns:view', this.freshbooks.ns).text()
          this.links.statement = xml.get('//xmlns:statement', this.freshbooks.ns).text()
          break

        case 'credits':
          // Technically currency is an attribute not a name but haven't worked out a better way of handling this quite yet
          nodes[x].childNodes().forEach(function (a) {
            if (a.name() !== 'text') {
              self.credits[a.attr('currency').value()] = a.text()
            }
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
 * Creates a Client.
 *
 * @param {Function} fn
 * @api public
 */

Client.prototype.create = function (fn) {
  var self = this

  this._setXML('client.create', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err != null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() != 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT CREATE CLIENT: ' + err))
      } else {
        self.client_id = xml.get('//xmlns:client_id', self.freshbooks.ns).text()
        self.get(self.client_id, fn)
      }
    })
  })
}

/**
 * Updates a Client.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Client.prototype.update = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.client_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('client.update', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err != null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() != 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT UPDATE CLIENT: ' + err))
      } else {
        self.get(self.client_id, fn)
      }
    })
  })
}

/**
 * Gets a Client.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Client.prototype.get = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.client_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('client.get', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err != null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() != 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT GET CLIENT: ' + err))
      } else {
        self._getXML(xml, function () {
          fn(null, self)
        })
      }
    })
  })
}

/**
 * Deletes a Client.
 *
 * @param (Number) id
 * @param {Function} fn
 * @api public
 */

Client.prototype.delete = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.client_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('client.delete', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err != null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() != 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT DELETE CLIENT: ' + err))
      } else {
        fn()
      }
    })
  })
}

/**
 * List Clients.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Client.prototype.list = function (fn) {
  var self = this
  var options = []

  if (typeof arguments[1] === 'function') {
    options = arguments[0]
    fn = arguments[1]
  }

  this._setXML('client.list', options, function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() != 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT LIST CLIENTS: ' + err))
      } else {
        var clients = xml.get('//xmlns:clients', self.freshbooks.ns)
        var options = {
          page: clients.attr('page').value(),
          per_page: clients.attr('per_page').value(),
          pages: clients.attr('pages').value(),
          total: clients.attr('total').value()
        }
        clients = []

        xml.find('//xmlns:client', self.freshbooks.ns).forEach(function (a) {
          var client = new self.freshbooks.Client()
          xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
          client._getXML(xml, function () {
            clients.push(client)
          })
        })

        fn(null, clients, options)
      }
    })
  })
}
