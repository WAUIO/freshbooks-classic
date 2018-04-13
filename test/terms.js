import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'

import FreshBooks from '..'

test.serial('get', async t => {
	const {terms} = new FreshBooks(url, token)
	const result = await terms.get({type: 'estimate'})
	t.true(_.isString(result), 'returns string')
})

test.serial('get (direct selection)', async t => {
	const {terms} = new FreshBooks(url, token)
	const result = await terms.get('invoice')
	t.true(_.isString(result), 'returns string')
})

test.serial('list', async t => {
	const {terms} = new FreshBooks(url, token)
	const result = await terms.list()
	t.true(_.isPlainObject(result), 'returns plain terms object')
	t.true(_.isString(result.invoice), 'has invoice term')
	t.true(_.isString(result.estimate), 'has estimate term')
	t.true(_.isString(result.credit), 'has credit term')
})

test('throw failures', async t => {
	const {terms} = new FreshBooks(url, token)
	await Promise.all([
		async () => {
			const fn = () => terms.get()
			await t.throws(fn, `Parameter 'type' is required.`)
		},
		async () => {
			const fn = () => terms.get('a')
			const e = await t.throws(fn, `Invalid value for field 'type'.`)
			t.is(e.code, 40060)
		},
	].map(fn => fn()))
})
