import Endpoint from '../Endpoint'

const name = 'callback'
const paginate = 'callbacks'
const key = `${name}_id`
const select = {[key]: 'string!'}
const schema = {
	event: 'string',
	uri: 'string',
	verifier: 'string',
}
const filter = {
	event: 'string',
	uri: 'string',
}
const methods = {
	create: [{schema: true, required: 'email', wrap: true, result: key}],
	delete: [{select: true, result: true}],
	list: [{paginate}, filter],
	verify: [{schema: true, select: true, required: 'verifier', wrap: true, result: true}],
	resendToken: [{select: true, result: true}],
}

module.exports = options => new Callback(options)
class Callback extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Callback, methods, {key, select, schema})
	}
}
