import {build} from '../utils/xml'
import {spread} from '../utils/params'

class Estimate {
	constructor({http}){
		this.name = 'estimate'
		this.post = http.post.bind(http)
		this.xml = action => build(`${this.name}.${action}`)
		return this
	}
	async create(options){
		const {post, name, xml} = this
		const action = 'create'
		const schema = {
			client_id: 'string!',
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

		const $xml = xml(action)
		spread(schema, options)($xml.element(name))
		const {estimate_id} = await post($xml.end())
		return estimate_id
	}
}

module.exports = (options) => new Estimate(options)
