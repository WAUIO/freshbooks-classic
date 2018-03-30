import Endpoint from '../Endpoint'

const name = 'estimate'
const paginate = 'estimates'
const key = `${name}_id`
const select = {[key]: 'string!'}
const schema = {
	client_id: 'string',
	contacts: 'array[contact.contact_id]',
	status: 'string',
	po_number: 'string',
	discount: 'string',
	currency_code: 'string',
	language: 'string',
	notes: 'string',
	terms: 'string',
	first_name: 'string',
	last_name: 'string',
	organization: 'string',
	p_street1: 'string',
	p_street2: 'string',
	p_city: 'string',
	p_state: 'string',
	p_country: 'string',
	p_code: 'string',
	vat_name: 'string',
	vat_number: 'string',
	lines: 'array[line]',
}
const filter = {
	client_id: 'string',
	folder: 'string',
	date_from: 'string',
	date_to: 'string',
}
const methods = {
	create: [{schema: true, required: 'client_id', wrap: true, result: key}],
	update: [{schema: true, select: true, wrap: true, result: true}],
	get: [{select: true, result: name}],
	delete: [{select: true, result: true}],
	list: [{paginate}, filter],
	sendByEmail: [
		{select: true, result: true},
		{subject: 'string', message: 'string'},
	],
	getPDF: [{select: true, raw: true}],
	accept: [{select: true, result: true}],
	markAsSent: [{select: true, result: true}],
}

module.exports = options => new Estimate(options)
class Estimate extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Estimate, methods, {key, select, schema})
	}
}
