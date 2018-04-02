import Endpoint from '../Endpoint'

const name = 'client'
const paginate = 'clients'
const key = `${name}_id`
const select = {[key]: 'string!'}
const schema = {
	first_name: 'string',
	last_name: 'string',
	organization: 'string',
	email: 'string',
	username: 'string',
	password: 'string',
	contacts: 'array[contact]',
	work_phone: 'string',
	home_phone: 'string',
	mobile: 'string',
	fax: 'string',
	language: 'string',
	currency_code: 'string',
	notes: 'string',
	p_street1: 'string',
	p_street2: 'string',
	p_city: 'string',
	p_state: 'string',
	p_country: 'string',
	p_code: 'string',
	s_street1: 'string',
	s_street2: 'string',
	s_city: 'string',
	s_state: 'string',
	s_country: 'string',
	s_code: 'string',
	vat_name: 'string',
	vat_number: 'string',
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

module.exports = options => new Client(options)
class Client extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Client, methods, {key, select, schema})
	}
}
