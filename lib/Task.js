var libxml = require('libxmljs')

/**
 * Creates a new Task.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Task}
 * @api public
 */

var Task = (module.exports = function() {})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Task.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for task.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'task.create':
		case 'task.update':
			var task = request.node('task')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'freshbooks':
							break

						default:
							task.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'task.get':
		case 'task.delete':
			request.node('task_id').text(this.task_id)
			break

		case 'task.list':
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
 * Sets Task properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Task.prototype._getXML = function(xml, fn) {
	var nodes = xml.get('//xmlns:task', this.freshbooks.ns).childNodes()

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
 * Creates an Task.
 *
 * @param {Function} fn
 * @api public
 */

Task.prototype.create = function(fn) {

	this._setXML('task.create', xml => {
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
				fn(new Error('CANNOT CREATE TASK: ' + err))
			} else {
				this.task_id = xml.get('//xmlns:task_id', this.freshbooks.ns).text()
				this.get(this.task_id, fn)
			}
		})
	})
}

/**
 * Updates an Task.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Task.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.task_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('task.update', xml => {
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
				fn(new Error('CANNOT UPDATE TASK: ' + err))
			} else {
				this.get(this.task_id, fn)
			}
		})
	})
}

/**
 * Gets an Task.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Task.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.task_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('task.get', xml => {
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
				fn(new Error('CANNOT GET TASK: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
			}
		})
	})
}

/**
 * Deletes an Task.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Task.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.task_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('task.delete', xml => {
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
				fn(new Error('CANNOT DELETE TASK: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Tasks.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Task.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('task.list', options, xml => {
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
				fn(new Error('CANNOT LIST TASKS: ' + err))
			} else {
				var tasks = xml.get('//xmlns:tasks', this.freshbooks.ns)
				var options = {
					page: tasks.attr('page').value(),
					per_page: tasks.attr('per_page').value(),
					pages: tasks.attr('pages').value(),
					total: tasks.attr('total').value(),
				}
				tasks = []

				xml.find('//xmlns:task', this.freshbooks.ns).forEach(a => {
					var task = new this.freshbooks.Task()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					task._getXML(xml, () => {
						tasks.push(task)
					})
				})

				fn(null, tasks, options)
			}
		})
	})
}
