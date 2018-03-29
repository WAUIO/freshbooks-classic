import _ from 'lodash/fp'
import {build} from './utils/xml'
import {spread} from './utils/params'

export default class Endpoint {
	constructor({http}){
		this.post = http.post.bind(http)
	}
	setMethods(BaseClass, object, baseOptions = {}){
		Object.keys(object).forEach(key => {
			this.setMethod(BaseClass, baseOptions)(key, ...object[key])
		})
		this.freezeMethods()
	}
	setMethod(BaseClass, {schema: baseSchema, select: baseSelect}){
		return (action, {required, wrap, schema, select, raw, paginate, result = _.identity} = {}, actionSchema) => {
			if(this.__freezed) return
			const {post, name} = this

			const _schema = {
				...(schema && baseSchema),
				...(select && baseSelect),
				...(paginate && {page: 'string', per_page: 'string'}),
				...actionSchema,
				..._.transform((result, prop) => {
					const get = _.get(prop)
					const value = get(actionSchema) || get(baseSchema)
					if(value){
						result[prop] = `${value}!`.replace(/!!$/, '!')
					}
				}, {}, _.castArray(required || [])),
			}

			BaseClass.__methods = BaseClass.__methods || []
			BaseClass.__methods.push(action)

			BaseClass.prototype[action] = async function(options){
				const $xml = build(`${name}.${action}`)
				let $root = $xml
				if(wrap){
					$root = $xml.element(_.isString(wrap) ? wrap : name)
				}
				spread(_schema, options)($root)
				const response = await post($xml.end(), {raw})

				if(_.isBoolean(result)) return result
				if(_.isString(result)) return _.get(result, response)
				if(_.isArray(result)) return _.pick(result, response)
				if(_.isFunction(result)) return result(response)
				return response
			}
			if(_.isString(paginate)){
				BaseClass.prototype[`${action}All`] = async function(options){
					const request = page => this[action]({...options, page, per_page: 100})
					const first = await request(1)
					const pages = _.range(first.page + 1, first.pages + 1).map(request)
					return _.flow([
						_.map(paginate),
						_.spread(_.concat([])),
					])(await Promise.all([first, ...pages]))
				}
			}
		}
	}
	freezeMethods(){
		this.__freezed = true
	}
}
