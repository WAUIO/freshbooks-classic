import _ from 'lodash/fp'
import Endpoint from '../Endpoint'

const name = 'default_terms'
const key = 'type'
const select = {[key]: 'string!'}
const schema = {
	type: 'string',
	message: 'string',
}

const _get = _.getOr('', 'message')
const _list = _.flow([_.getOr([], name), _.keyBy(key), _.mapValues(_get)])

const methods = {
	list: [{result: _list}],
	get: [{select: true, result: _get}],
	update: [{schema: true, select: true, wrap: true, result: true}],
}

module.exports = options => new Estimate(options)
class Estimate extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Estimate, methods, {key, select, schema})
	}
}
