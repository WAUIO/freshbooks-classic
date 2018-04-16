import FreshBooksFetch from './utils/fetch'

class FreshBooks {
	constructor(url, token){
		const http = new FreshBooksFetch({url, token})

		// this.category = require('./api/category')({http})
		this.callback = require('./api/callback')({http})
		this.client = require('./api/client')({http})
		this.estimate = require('./api/estimate')({http})
		// this.expense = require('./api/expense')({http})
		// this.gateway = require('./api/gateway')({http})
		// this.invoice = require('./api/invoice')({http})
		this.item = require('./api/item')({http})
		this.languages = require('./api/languages')({http})
		// this.payment = require('./api/payment')({http})
		// this.project = require('./api/project')({http})
		// this.recurring = require('./api/recurring')({http})
		// this.staff = require('./api/staff')({http})
		// this.task = require('./api/task')({http})
		// this.tax = require('./api/tax')({http})
		this.terms = require('./api/terms')({http})
		// this.timeEntry = require('./api/time-entry')({http})
	}
}

exports.default = FreshBooks
module.exports = exports['default']
