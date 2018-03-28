import FreshBooksFetch from './utils/fetch'

export default class FreshBooks {
	constructor(url, token){
		const instance = {
			http: new FreshBooksFetch({url, token}),
		}

		// this.Category = require('./api/Category')(instance)
		// this.Client = require('./api/Client')(instance)
		this.Estimate = require('./api/Estimate')(instance)
		// this.Expense = require('./api/Expense')(instance)
		// this.Gateway = require('./api/Gateway')(instance)
		// this.Invoice = require('./api/Invoice')(instance)
		// this.Item = require('./api/Item')(instance)
		// this.Language = require('./api/Language')(instance)
		// this.Payment = require('./api/Payment')(instance)
		// this.Project = require('./api/Project')(instance)
		// this.Recurring = require('./api/Recurring')(instance)
		// this.Staff = require('./api/Staff')(instance)
		// this.Task = require('./api/Task')(instance)
		// this.Tax = require('./api/Tax')(instance)
		// this.TimeEntry = require('./api/TimeEntry')(instance)
	}
}
