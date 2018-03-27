const NS = 'http://www.freshbooks.com/api/'
var {DOMImplementation, DOMParser} = require('xmldom')
var select = require('xpath').useNamespaces({'': NS, 'xmlns': NS})

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
	var xml = new DOMImplementation().createDocument()

	var request = xml.appendChild(xml.createElement('request'))
	request.setAttribute('method', method)
	var options

	// If second argument not a function then we have been passed the 'options' for project.list
	if (typeof arguments[2] === 'function') {
		options = arguments[1]
		fn = arguments[2]
	}

	switch (method) {
		case 'project.create':
		case 'project.update':
			var project = request.appendChild(xml.createElement('project'))

			for (var key in this) {
				if (typeof this[key] !== 'function' && typeof this[key] !== 'undefined') {
					switch (key) {
						// Catch resulting values that can't be created/updated.
						case 'staff':
						case 'budget':
						case 'freshbooks':
						case 'project':
							break

						case 'tasks':
							if (this.tasks.length > 0) {
								var tasks = request.appendChild(xml.createElement('tasks'))

								this.tasks.forEach(a => {
									var task = tasks.appendChild(xml.createElement('task'))

									for (var key in a) {
										task.appendChild(xml.createElement(key)).textContent = a[key]
									}
								})
							}
							break
							break

						default:
							project.appendChild(xml.createElement(key)).textContent = this[key]
							break
					}
				}
			}
			break

		case 'project.get':
		case 'project.delete':
			request.appendChild(xml.createElement('project_id')).textContent = this.project_id
			break

		case 'project.list':
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
 * Sets Project properties from results of XML request.
 *
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */

Project.prototype._getXML = function(xml, fn) {
	var nodes = select('//xmlns:project', xml)

	for (var x = 0; x < nodes.length; x++) {
		if (nodes[x].nodeName !== '#text') {
			switch (nodes[x].nodeName) {
				case 'tasks':
					select('//xmlns:task', xml).forEach(a => {
						var task = {}
						var a = a.childNodes

						for (var y = 0; y < a.length; y++) {
							if (a[y].nodeName !== '#text') {
								task.setAttribute(a[y].nodeName, (a[y].nodeValue || a[y].value))
							}
						}
						this.tasks.push(task)
					})
					break

				case 'staff':
					select('//xmlns:line', xml).forEach(a => {
						var staff = {}
						var a = a.childNodes

						for (var y = 0; y < a.length; y++) {
							if (a[y].nodeName !== '#text') {
								staff.setAttribute(a[y].nodeName, (a[y].nodeValue || a[y].value))
							}
						}
						this.staff.push(staff)
					})
					break

				default:
					this[nodes[x].nodeName] = (nodes[x].nodeValue || nodes[x].value)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT CREATE PROJECT: ' + err))
			} else {
				this.project_id = select('string(//xmlns:project_id)', xml)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT GET PROJECT: ' + err))
			} else {
				this._getXML(xml, () => fn(null, this))
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
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
				select('string(/xmlns:response/@status)', xml) !== 'ok'
			) {
				err = select('string(//xmlns:error)', xml)
				fn(new Error('CANNOT LIST PROJECTS: ' + err))
			} else {
				var projects = select('//xmlns:projects', xml)
				var options = {
					page: select('string(/@page)', projects),
					per_page: select('string(/@per_page)', projects),
					pages: select('string(/@pages)', projects),
					total: select('string(/@total)', projects),
				}
				projects = []

				select('//xmlns:project', xml).forEach(a => {
					var project = new this.freshbooks.Project()
					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
					project._getXML(xml, () => {projects.push(project)})
				})

				fn(null, projects, options)
			}
		})
	})
}
