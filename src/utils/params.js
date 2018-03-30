import _ from 'lodash/fp'

const typeIsRequired = _.endsWith('!')
const typeIsArray = _.startsWith('array[')
const typeIsString = _.startsWith('string')
const valueIsString = _.anyPass([_.isFinite, _.isString])

const parseArrayKeys = (prop, type) => {
	const nested = /^array\[(.+)\]/g.exec(type)[1].split('.')
	const parts = [prop, ...nested]
	return [_.initial(parts), _.last(parts)]
}

const inferType = value => {
	if(valueIsString(value)) return 'string'
	if(_.isPlainObject(value)) return 'object'
	throw new Error(`unsuported type "${typeof value}"`)
}

const validate = (value, type, prop) => {
	if(typeIsRequired(type) && _.isNil(value)){
		throw new Error(`Parameter '${prop}' is required.`)
	}
	if(!_.isNil(value)){
		if(typeIsArray(type) && !_.isArray(value)){
			throw new TypeError(`Parameter '${prop}' must be an array.`)
		}
		if(typeIsString(type) && !valueIsString(value)){
			throw new TypeError(`Parameter '${prop}' must be text (number or string).`)
		}
	}
	return !_.isNil(value)
}

const assign = (value, prop, type = inferType(value)) => $xml => {
	if(typeIsString(type)){
		$xml.element(prop, _.toString(value))
		return
	}

	if(typeIsArray(type)){
		const [parents, child] = parseArrayKeys(prop, type)
		const $parents = parents.reduce(($, key) => $.element(key), $xml)
		value.forEach(item => {
			assign(item, child)($parents)
		})
		return
	}

	if(type === 'object'){
		const $obj = $xml.element(prop)
		_.keys(value).forEach(prop => {
			assign(value[prop], prop)($obj)
		})
		return
	}
}

export const spread = (schema = {}, obj = {}) => $xml => (
	_.keys(schema).forEach(prop => {
		const value = obj[prop]
		const type = schema[prop]
		const valid = validate(value, type, prop)
		return valid && assign(value, prop, type)($xml)
	})
)
