import _ from 'lodash/fp'
import lodash from 'lodash'
import {parseStringSync} from 'xml2js-parser'
import xmlbuilder from 'xmlbuilder'

const BOOL_REGEXP = /^(?:true|false)$/i
const PARSE_OPTIONS = {
	trim: true,
	explicitRoot: false,
	emptyTag: undefined,
	explicitArray: false,
	mergeAttrs: true,
}

const parseSync = str => parseStringSync(str, PARSE_OPTIONS)
const parsePlurals = (key, value) => {
	const singular = key.replace(/s$/, '')
	if(singular === key) return [false]
	if(value[singular] === undefined) return [false]
	const pageProps = _.pick(['page', 'per_page', 'pages', 'total'], value)
	return [singular, _.size(pageProps) === 4 ? pageProps : undefined]
}
const castArray = a => {
	if(_.isArray(a)) return a
	if(_.isPlainObject(a) && a[1]) return _.toArray(a)
	return _.castArray(a)
}
const parseValue = value => [
	x => !isFinite(x) ? x : (x % 1 === 0 ? parseInt(x, 10) : parseFloat(x)),
	x => !(BOOL_REGEXP.test(x)) ? x : (x.toLowerCase() === 'true'),
].reduce((v, func) => func(v), value)

const cleanup = a => lodash.transform(a, (result, value, key) => {
	if(_.isArray(value)){
		result[key] = _.map(cleanup, value)
		return
	}
	if(_.isPlainObject(value)){
		if(value.deprecated) return
		const [singular, pageProps] = parsePlurals(key, value)
		if(singular){
			result = Object.assign(result, pageProps)
			result[plural] = castArray(cleanup(value[singular])) // [TODO]: make it simple
			return
		}
		result[key] = cleanup(value)
		return
	}
	if(key === 'xmlns') return
	if(value === undefined) return
	result[key] = parseValue(value)
}, {})

export const parse = _.flow([parseSync, cleanup])
export const build = method => xmlbuilder.create('request').attribute('method', method)
