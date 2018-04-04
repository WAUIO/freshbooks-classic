import FreshBooksFetch from './utils/fetch'

class FreshBooks {
	constructor(url, token){
		const http = new FreshBooksFetch({url, token})

		// this.category = require('./api/Category')({http})
		this.callback = require('./api/Callback')({http})
		this.client = require('./api/client')({http})
		this.estimate = require('./api/estimate')({http})
		// this.expense = require('./api/Expense')({http})
		// this.gateway = require('./api/Gateway')({http})
		// this.invoice = require('./api/Invoice')({http})
		// this.item = require('./api/Item')({http})
		// this.language = require('./api/Language')({http})
		// this.payment = require('./api/Payment')({http})
		// this.project = require('./api/Project')({http})
		// this.recurring = require('./api/Recurring')({http})
		// this.staff = require('./api/Staff')({http})
		// this.task = require('./api/Task')({http})
		// this.tax = require('./api/Tax')({http})
		// this.timeEntry = require('./api/TimeEntry')({http})
	}
}

exports.default = FreshBooks
module.exports = exports['default']
