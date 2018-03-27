var libxml = require('libxmljs')

/**
 * Creates a new Project.
 *
 * @param {FreshBooks} FreshBooks
 * @return {Project}
 * @api public
 */

var Project = (module.exports = function() {
	this.staff = []
	this.tasks = []
})

/**
 * Constructs XML requests for the API depending on method.
 *
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */

Project.prototype._setXML = function(method, fn) {
	var xml = new libxml.Document()
	var request = xml.node('request').attr('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for project.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'project.create':
		case 'project.update':
			var project = request.node('project')

			for (var key in this) {
				if (typeof this[key] !== 'function') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'staff':
						case 'budget':
						case 'freshbooks':
							break

						case 'tasks':
							if (this.tasks.length > 0) {
								var tasks = request.node('tasks')

								this.tasks.forEach(a => {
									var task = tasks.node('task')

									for (var key in a) {
										task.node(key).text(a[key])
									}
								})
							}
							break
							break

						default:
							project.node(key).text(this[key])
							break
					}
				}
			}
			break

		case 'project.get':
		case 'project.delete':
			request.node('project_id').text(this.project_id)
			break

		case 'project.list':
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
 * Sets Project properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Project.prototype._getXML = function(xml, fn) {
	var nodes = xml.get('//xmlns:project', this.freshbooks.ns).childNodes()

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].name() !== 'text') {
			switch (nodes[x].name()) {
				case 'tasks':
					xml.find('//xmlns:task', this.freshbooks.ns).forEach(a => {
						var task = {}
						var a = a.childNodes()

						for (var y = 0; y < a.length; y++) {
							if (a[y].name() !== 'text') {
								task[a[y].name()] = a[y].text()
							}
						}
						this.tasks.push(task)
					})
					break

				case 'staff':
					xml.find('//xmlns:line', this.freshbooks.ns).forEach(a => {
						var staff = {}
						var a = a.childNodes()

						for (var y = 0; y < a.length; y++) {
							if (a[y].name() !== 'text') {
								staff[a[y].name()] = a[y].text()
							}
						}
						this.staff.push(staff)
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
 * Creates an Project.
 *
 * @param {Function} fn
 * @api public
 */

Project.prototype.create = function(fn) {

	this._setXML('project.create', xml => {
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
				fn(new Error('CANNOT CREATE PROJECT: ' + err))
			} else {
				this.project_id = xml.get('//xmlns:project_id', this.freshbooks.ns).text()
				this.get(this.project_id, fn)
			}
		})
	})
}

/**
 * Updates an Project.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Project.prototype.update = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.project_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('project.update', xml => {
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
				fn(new Error('CANNOT UPDATE PROJECT: ' + err))
			} else {
				this.get(this.project_id, fn)
			}
		})
	})
}

/**
 * Gets an Project.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Project.prototype.get = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.project_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('project.get', xml => {
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
				fn(new Error('CANNOT GET PROJECT: ' + err))
			} else {
				this._getXML(xml, () => {
					fn(null, this)
				})
			}
		})
	})
}

/**
 * Deletes an Project.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Project.prototype.delete = function(fn) {

	if (typeof arguments[1] === 'function') {
		this.project_id = arguments[0]
		fn = arguments[1]
	}

	this._setXML('project.delete', xml => {
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
				fn(new Error('CANNOT DELETE PROJECT: ' + err))
			} else {
				fn()
			}
		})
	})
}

/**
 * List Projects.
 *
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */

Project.prototype.list = function(fn) {
	var options = []

	if (typeof arguments[1] === 'function') {
		options = arguments[0]
		fn = arguments[1]
	}

	this._setXML('project.list', options, xml => {
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
				fn(new Error('CANNOT LIST PROJECTS: ' + err))
			} else {
				var projects = xml.get('//xmlns:projects', this.freshbooks.ns)
				var options = {
					page: projects.attr('page').value(),
					per_page: projects.attr('per_page').value(),
					pages: projects.attr('pages').value(),
					total: projects.attr('total').value(),
				}
				projects = []

				xml.find('//xmlns:project', this.freshbooks.ns).forEach(a => {
					var project = new this.freshbooks.Project()
					xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					project._getXML(xml, () => {
						projects.push(project)
					})
				})

				fn(null, projects, options)
			}
		})
	})
}
