import test from 'ava'
import Fetch from '../lib/utils/fetch'
import {url, token} from './credentials'


test('invalid endpoint', async t => {
	const url = 'https://non-existing-system.freshbooks.com/api/2.1/xml-in'
	const fetch = new Fetch({token, url})
	const fn = () => fetch.post('')
	const e = await t.throws(fn, 'System does not exist.')
	t.is(e.code, 10030)
})

test('invalid server', async t => {
	const url = 'https://system.not-freshbooks.cloud/api/2.1/xml-in'
	const fetch = new Fetch({token, url})
	const fn = () => fetch.post('')
	await t.throws(fn, /^CANNOT CONNECT TO FRESHBOOKS/, )
})

test('wrong token', async t => {
	const url = 'https://example.freshbooks.com/api/2.1/xml-in'
	const fetch = new Fetch({token, url})
	const fn = () => fetch.post('')
	await t.throws(fn, 'HTTPS: 401')
})

test('bad xml', async t => {
	const fetch = new Fetch({token, url})
	const fn = () => fetch.post('')
	const e = await t.throws(fn, 'Your XML is not formatted correctly.')
	t.is(e.code, 40010)
})
