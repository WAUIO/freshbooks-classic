var libxml = require('libxmljs')

/**
 * Creates a new Expense.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Expense}
 * @api public
 */

var Expense = module.exports = function () {

}

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Expense.prototype._setXML = function (method, fn) {
  var xml = new libxml.Document()
  var request = xml.node('request').attr('method', method)
  var options
  var self = this

  // If second argument not a function then we have been passed the 'options' for expense.list
  if (typeof arguments[2] === 'function') {
    options = arguments[1]
    fn = arguments[2]
  }

  switch (method) {
    case 'expense.create':
    case 'expense.update':
      var expense = request.node('expense')

      for (var key in this) {
        if (typeof this[key] !== 'function') {
          switch (key) {
            // Catch resulting values that can't be created/updated.
            case 'freshbooks':
            case 'updated':
              break

            default:
              expense.node(key).text(this[key])
              break
          }
        }
      }
      break

    case 'expense.get':
    case 'expense.delete':
      request.node('expense_id').text(self.expense_id)
      break

    case 'expense.list':
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
 * Sets Expense properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Expense.prototype._getXML = function (xml, fn) {
  var self = this
  var nodes = xml.get('//xmlns:expense', this.freshbooks.ns).childNodes()

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
 * Creates an Expense.
 *
 * @param {Function} fn
 * @api public
 */

Expense.prototype.create = function (fn) {
  var self = this

  this._setXML('expense.create', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT CREATE EXPENSE: ' + err))
      } else {
        self.expense_id = xml.get('//xmlns:expense_id', self.freshbooks.ns).text()
        self.get(self.expense_id, fn)
      }
    })
  })
}

/**
 * Updates an Expense.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Expense.prototype.update = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.expense_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('expense.update', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT UPDATE EXPENSE: ' + err))
      } else {
        self.get(self.expense_id, fn)
      }
    })
  })
}

/**
 * Gets an Expense.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Expense.prototype.get = function (id, fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.expense_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('expense.get', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT GET EXPENSE: ' + err))
      } else {
        self._getXML(xml, function () {
          fn(null, self)
        })
      }
    })
  })
}

/**
 * Deletes an Expense.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Expense.prototype.delete = function (fn) {
  var self = this

  if (typeof arguments[1] === 'function') {
    this.expense_id = arguments[0]
    fn = arguments[1]
  }

  this._setXML('expense.delete', function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT DELETE EXPENSE: ' + err))
      } else {
        fn()
      }
    })
  })
}

/**
 * List Expenses.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Expense.prototype.list = function (fn) {
  var self = this
  var options = []

  if (typeof arguments[1] === 'function') {
    options = arguments[0]
    fn = arguments[1]
  }

  this._setXML('expense.list', options, function (xml) {
    self.freshbooks._get(xml, function (err, xml) {
      if (err !== null) {
        fn(err)
      } else if (xml.get('//xmlns:response', self.freshbooks.ns).attr('status').value() !== 'ok') {
        err = xml.get('//xmlns:error', self.freshbooks.ns).text()
        fn(new Error('CANNOT LIST EXPENSES: ' + err))
      } else {
        var expenses = xml.get('//xmlns:expenses', self.freshbooks.ns)
        var options = {
          page: expenses.attr('page').value(),
          per_page: expenses.attr('per_page').value(),
          pages: expenses.attr('pages').value(),
          total: expenses.attr('total').value()
        }
        expenses = []

        xml.find('//xmlns:expense', self.freshbooks.ns).forEach(function (a) {
          var expense = new self.freshbooks.Expense()
          xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
          expense._getXML(xml, function () {
            expenses.push(expense)
          })
        })

        fn(null, expenses, options)
      }
    })
  })
}
