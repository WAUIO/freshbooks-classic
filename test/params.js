import test from 'ava'
import {spread} from '../lib/utils/params'
import {build} from '../lib/utils/xml'

const DOCTYPE = '<?xml version="1.0"?>'

const ARRAY_OF_STRINGS = [
	DOCTYPE,
	'<request method="test.array">',
	'<links>',
		'<link>1</link>',
		'<link>2</link>',
	'</links>',
	'</request>',
].join('')

const ARRAY_OF_OBJECTS = [
	DOCTYPE,
	'<request method="test.array">',
	'<lines>',
		'<line>',
			'<name>Test</name>',
			'<unit_cost>5.00</unit_cost>',
			'<quantity>5</quantity>',
			'<type>Item</type>',
		'</line>',
		'<line>',
			'<name>Test Big</name>',
			'<unit_cost>15.00</unit_cost>',
			'<quantity>3</quantity>',
			'<type>Item</type>',
		'</line>',
	'</lines>',
	'</request>',
].join('')

test('ommit props outside schema', t => {
	const $xml = build('test.array')
	spread({links: 'array[link]'}, {text: 'abc'})($xml)
	t.is(`${DOCTYPE}<request method="test.array"/>`, $xml.end())
})

test('error when missing required parameter', t => {
	const $xml = build('test.array')
	const fn = () => spread({estimate_id: 'string!'}, {text: 'abc'})($xml)
	t.throws(fn, `Parameter 'estimate_id' is required.`)
})

test('error when wrong parameter type', t => {
	const $xml = build('test.array')
	const fn1 = () => spread({estimate_id: 'string'}, {estimate_id: []})($xml)
	const fn2 = () => spread({estimate_id: 'string'}, {estimate_id: true})($xml)
	const fn3 = () => spread({lines: 'array[line]'}, {lines: 'text'})($xml)
	t.throws(fn1, `Parameter 'estimate_id' must be text (number or string).`)
	t.throws(fn2, `Parameter 'estimate_id' must be text (number or string).`)
	t.throws(fn3, `Parameter 'lines' must be an array.`)
})

test('error when nesting unsuported types', t => {
	const $xml = build('test.array')
	const fn1 = () => spread({lines: 'array[line]'}, {lines: [{x: []}]})($xml)
	const fn2 = () => spread({lines: 'array[line]'}, {lines: [true]})($xml)
	t.throws(fn1, `unsuported type "object"`)
	t.throws(fn2, `unsuported type "boolean"`)
})

test('array of strings', t => {
	const $xml = build('test.array')
	spread({links: 'array[link]!'}, {links: ['1', '2']})($xml)
	t.is(ARRAY_OF_STRINGS, $xml.end())
})

test('array of objects', t => {
	const $xml = build('test.array')
	spread({lines: 'array[line]!'}, {lines: [
		{name: 'Test', unit_cost: '5.00', quantity: '5', type: 'Item'},
		{name: 'Test Big', unit_cost: '15.00', quantity: '3', type: 'Item'},
	]})($xml)
	t.is(ARRAY_OF_OBJECTS, $xml.end())
})
