import Endpoint from '../Endpoint'

const name = 'invoice'
const paginate = 'invoices'
const key = `${name}_id`
const select = {[key]: 'string!'}
const schema = {
	invoice_id: 'string',
    client_id: 'string',
	contacts: 'array[contact]',
	number: 'string',
	amount: 'string',
	amount_outstanding: 'string',
    status: 'string',
    date: 'string',
    po_number: 'string',
    discount: 'string',
    notes: 'string',
	currency_code: 'string',
	folder: 'string',
    language: 'string',
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
    lines: 'array[line]'
}
const filter = {
	email: 'string',
	username: 'string',
	updated_from: 'string',
	updated_to: 'string',
	folder: 'string',
}
const methods = {
	create: [{schema: true, required: 'email', wrap: true, result: key}],
	update: [{schema: true, select: true, wrap: true, result: true}],
	get: [{select: true, result: name}],
	delete: [{select: true, result: true}],
	list: [{paginate}, filter],
}

module.exports = options => new Invoice(options)
class Invoice extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Invoice, methods, {key, select, schema})
	}
}
