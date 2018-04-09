import Endpoint from '../Endpoint'

const name = 'item'
const paginate = 'items'
const key = `${name}_id`
const select = {[key]: 'string!'}
const schema = {
	'name': 'string',
	'description': 'string',
	'unit_cost': 'string',
	'quantity': 'string',
	'inventory': 'string',
	'folder': 'string',
}
const filter = {
	folder: 'string',
}
const methods = {
	create: [{schema: true, required: 'name', wrap: true, result: key}],
	update: [{schema: true, select: true, wrap: true, result: true}],
	get: [{select: true, result: name}],
	delete: [{select: true, result: true}],
	list: [{paginate}, filter],
}

module.exports = options => new Item(options)
class Item extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Item, methods, {key, select, schema})
	}
}
