import {builder} from '../utils/xml'
import {spread} from '../utils/params'

function Estimate({http}){
	if(!(this instanceof Estimate)) return new Estimate()
	this.name = estimate
	this.post = http.post.bind(http)
	this.builder = action => builder(`${this.name}.${action}`)
}

Estimate.prototype.create = async function create(options){
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

	const $xml = this.builder('create')
	const $estimate.ele('estimate')
	spread(schema, options)($estimate)
	const {estimate_id} = await this.post($xml)
	return estimate_id
}

// Estimate.prototype.update = async function(fn){

// 	if (typeof arguments[1] === 'function') {
// 		this.estimate_id = arguments[0]
// 		fn = arguments[1]
// 	}

// 	this._setXML('estimate.update', xml => {
// 		this.freshbooks._get(xml, (err, xml) => {
// 			if (err !== null) {
// 				fn(err)
// 			} else if (
// 					select('string(/xmlns:response/@status)', xml) !== 'ok'
// 			) {
// 				err = select('string(//xmlns:error)', xml)
// 				fn(new Error('CANNOT UPDATE ESTIMATE: ' + err))
// 			} else {
// 				this.get(this.estimate_id, fn)
// 			}
// 		})
// 	})
// }

// Estimate.prototype.get = async function(fn){

// 	if (typeof arguments[1] === 'function') {
// 		this.estimate_id = arguments[0]
// 		fn = arguments[1]
// 	}

// 	this._setXML('estimate.get', xml => {
// 		this.freshbooks._get(xml, (err, xml) => {
// 			if (err !== null) {
// 				fn(err)
// 			} else if (
// 					select('string(/xmlns:response/@status)', xml) !== 'ok'
// 			) {
// 				err = select('string(//xmlns:error)', xml)
// 				fn(new Error('CANNOT GET ESTIMATE: ' + err))
// 			} else {
// 				this._getXML(xml, () => fn(null, this))
// 			}
// 		})
// 	})
// }

// Estimate.prototype.delete = async function(fn){

// 	if (typeof arguments[1] === 'function') {
// 		this.estimate_id = arguments[0]
// 		fn = arguments[1]
// 	}

// 	this._setXML('estimate.delete', xml => {
// 		this.freshbooks._get(xml, (err, xml) => {
// 			if (err !== null) {
// 				fn(err)
// 			} else if (
// 					select('string(/xmlns:response/@status)', xml) !== 'ok'
// 			) {
// 				err = select('string(//xmlns:error)', xml)
// 				fn(new Error('CANNOT DELETE ESTIMATE: ' + err))
// 			} else {
// 				fn()
// 			}
// 		})
// 	})
// }

// Estimate.prototype.list = async function(fn){
// 	var options = []

// 	if (typeof arguments[1] === 'function') {
// 		options = arguments[0]
// 		fn = arguments[1]
// 	}

// 	this._setXML('estimate.list', options, xml => {
// 		this.freshbooks._get(xml, (err, xml) => {
// 			if (err) {
// 				fn(err)
// 			} else if (
// 					select('string(/xmlns:response/@status)', xml) !== 'ok'
// 			) {
// 				err = select('string(//xmlns:error)', xml)
// 				fn(new Error('CANNOT LIST ESTIMATES: ' + err))
// 			} else {
// 				var estimates = select('//xmlns:estimates', xml)
// 				var options = {
// 					page: select('string(/@page)', estimates),
// 					per_page: select('string(/@per_page)', estimates),
// 					pages: select('string(/@pages)', estimates),
// 					total: select('string(/@total)', estimates),
// 				}
// 				var estimates = []

// 				select('//xmlns:estimate', xml).forEach(a => {
// 					var estimate = new this.freshbooks.Estimate()
// 					xml = new DOMParser({xmlns: {'':NS}}).parseFromString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>')
// 					estimate._getXML(xml, () => {estimates.push(estimate)})
// 				})

// 				fn(null, estimates, options)
// 			}
// 		})
// 	})
// }

// Estimate.prototype.sendByEmail = async function(fn){
// 	var options = []

// 	switch (typeof arguments[0]) {
// 		case 'object':
// 			options = arguments[0]
// 			fn = arguments[1]

// 			this.invoice_id = options.invoice_id || this.invoice_id
// 			break

// 		case 'number':
// 			this.invoice_id = arguments[0]
// 			break
// 	}

// 	this._setXML('estimate.sendByEmail', options, xml => {
// 		this.freshbooks._get(xml, (err, xml) => {
// 			if (err !== null) {
// 				fn(err)
// 			} else if (
// 					select('string(/xmlns:response/@status)', xml) !== 'ok'
// 			) {
// 				err = select('string(//xmlns:error)', xml)
// 				fn(new Error('CANNOT SEND ESTIMATE BY EMAIL: ' + err))
// 			} else {
// 				fn(null, this)
// 			}
// 		})
// 	})
// }

export default Estimate
