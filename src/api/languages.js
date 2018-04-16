import _ from 'lodash/fp'
import Endpoint from '../Endpoint'

const schema = {per_page: 'string'}
const options = {per_page: 100}
const name = 'language'
const result = _.flow([
	_.getOr([], 'languages'),
	_.keyBy('code'),
	_.mapValues(_.getOr('', 'name'))
])

const methods = {
	list: [{options, result}, schema],
}

module.exports = options => new Language(options)
class Language extends Endpoint {
	constructor({http}){
		super({http, name})
		this.setMethods(Language, methods)
	}
}
