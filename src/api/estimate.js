import _ from 'lodash/fp'
import {build} from '../utils/xml'
import {spread} from '../utils/params'

class Estimate {
	constructor({http}){
		this.name = 'estimate'
		this.post = http.post.bind(http)
		this.xml = action => build(`${this.name}.${action}`)
		this.schema = {
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
		return this
	}
	async create(options){
		const {post, name, xml, schema} = this
		const $xml = xml('create')
		spread({
			...schema,
			client_id: 'string!',
		}, options)($xml.element(name))
		const {estimate_id} = await post($xml.end())
		return estimate_id
	}
	async update(options){
		const {post, name, xml, schema} = this
		const $xml = xml('update')
		spread({
			...schema,
			estimate_id: 'string!',
		}, options)($xml.element(name))
		await post($xml.end())
		return true
	}
	async get(options){
		const {post, name, xml} = this
		const $xml = xml('get')
		spread({estimate_id: 'string!'}, options)($xml)
		const {estimate} = await post($xml.end())
		return estimate
	}
	async delete(options){
		const {post, name, xml} = this
		const $xml = xml('delete')
		spread({estimate_id: 'string!'}, options)($xml)
		await post($xml.end())
		return true
	}
	async list(options){
		const {post, name, xml} = this
		const $xml = xml('list')
		spread({
			client_id: 'string',
			folder: 'string',
			date_from: 'string',
			date_to: 'string',
			page: 'string',
			per_page: 'string',
		}, options)($xml)
		return await post($xml.end())
	}
	async sendByEmail(options){
		const {post, name, xml} = this
		const $xml = xml('sendByEmail')
		spread({
			estimate_id: 'string!',
			subject: 'string',
			message: 'string',
		}, options)($xml)
		await post($xml.end())
		return true
	}
	async getPDF(options){
		const {post, name, xml} = this
		const $xml = xml('getPDF')
		spread({estimate_id: 'string!'}, options)($xml)
		return await post($xml.end(), {raw: true})
	}
	async accept(options){
		const {post, name, xml} = this
		const $xml = xml('accept')
		spread({estimate_id: 'string!'}, options)($xml)
		await post($xml.end())
		return true
	}
	async markAsSent(options){
		const {post, name, xml} = this
		const $xml = xml('markAsSent')
		spread({estimate_id: 'string!'}, options)($xml)
		await post($xml.end())
		return true
	}
	async listAll(options){
		const request = page => this.list({...options, page, per_page: 100})
		const first = await request(1)
		const pages = _.range(first.page + 1, first.pages + 1).map(request)
		return _.flow([
			_.map('estimates'),
			_.spread(_.concat([])),
		])(await Promise.all([first, ...pages]))
	}
}

module.exports = (options) => new Estimate(options)
