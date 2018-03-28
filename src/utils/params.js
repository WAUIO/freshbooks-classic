import _ from 'lodash/fp'

const typeIsRequired = _.endsWith('!')
const typeIsArray = _.startsWith('array[')
const typeIsString = _.negate(typeIsArray)
const valueIsString = _.anyPass([_.isFinite, _.isString])
const getArrayKeys = type => /^array\[(.+)\]/g.exec(type)[1].split('.')

const validate = (value, type, prop) => {
	if(typeIsRequired(type) && _.isNil(value)){
		throw new Error(`Parameter [${prop}] is required.`)
	}
	if(typeIsArray(type) && !_.isArray(value)){
		throw new TypeError(`Parameter [${prop}] must be an Array.`)
	}
	if(typeIsString(type) && !valueIsString(value)){
		throw new TypeError(`Parameter [${prop}] must be text (number or string).`)
	}
}

export const spread = (schema, obj) => $xml => _.forEach(prop => {
	const value = obj[prop]
	const type = schema[prop]

	validate(value, type, prop)

	if(_.isNil(value)) return

	if(typeIsString(type)){
		return $xml.ele(prop, _.toString(value))
	}

	const keys = getArrayKeys(type)

	_.forEach(value, item => {
		const $item = keys.reduce(($, key) => $.ele(key), $xml)
		const itemSchema = _.mapValues(_.always('string'), item)
		spread(schema, item, $item)
	})
})(_.keys(schema))
