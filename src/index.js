import FreshBooksFetch from './utils/fetch'

export default class FreshBooks {
	constructor(url, token){
		const instance = {
			http: new FreshBooksFetch({url, token}),
		}

		// this.category = require('./api/Category')(instance)
		// this.client = require('./api/Client')(instance)
		this.estimate = require('./api/estimate')(instance)
		// this.expense = require('./api/Expense')(instance)
		// this.gateway = require('./api/Gateway')(instance)
		// this.invoice = require('./api/Invoice')(instance)
		// this.item = require('./api/Item')(instance)
		// this.language = require('./api/Language')(instance)
		// this.payment = require('./api/Payment')(instance)
		// this.project = require('./api/Project')(instance)
		// this.recurring = require('./api/Recurring')(instance)
		// this.staff = require('./api/Staff')(instance)
		// this.task = require('./api/Task')(instance)
		// this.tax = require('./api/Tax')(instance)
		// this.timeEntry = require('./api/TimeEntry')(instance)
	}
}
