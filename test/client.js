import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'
import FreshBooks from '..'

let client_id = null
const email = 'freshbooks-classic@dispostable.com'
const first_name = 'abc'
const last_name = 'xyz'

test.serial('create', async t => {
	const {client} = new FreshBooks(url, token)
	client_id = await client.create({email, first_name, last_name})
	t.true(_.isInteger(client_id), 'returns client_id')
})

test.serial('get (direct selection)', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.get(client_id)

	t.is(result.folder, 'active', 'is in active folder')
	t.is(result.client_id, client_id, 'matches provided client_id')
	t.is(result.email, email, 'matches provided email')
	t.is(result.first_name, first_name, 'matches provided first_name')
	t.is(result.last_name, last_name, 'matches provided last_name')
	t.true(_.isString(result.updated), 'has updated date')
	t.not(new Date(result.updated).toString(), 'Invalid Date', 'date is valid')
	t.true(_.isString(result.links.view), 'has links.view')
	t.true(_.isString(result.links.client_view), 'has links.client_view')
	t.true(_.isString(result.links.statement), 'has links.statement')
	t.is(result.contacts, undefined, 'has zero contacts')
})

test.serial('update', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.update({
		client_id,
		organization: 'ACME Industries',
		contacts: [
			{first_name: 'john', last_name: 'appleseed', email: 'j@example.com'},
		],
		mobile: '+555555555555',
		notes: 'Lorem Ipsum',
	})
	t.true(result, 'returns true')
})

test.serial('get', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.get({client_id})

	t.is(result.folder, 'active', 'is in active folder')
	t.is(result.client_id, client_id, 'matches provided client_id')
	t.is(result.email, email, 'matches provided email')
	t.is(result.first_name, first_name, 'matches provided first_name')
	t.is(result.last_name, last_name, 'matches provided last_name')
	t.is(result.notes, 'Lorem Ipsum', 'matches provided notes')
	t.true(_.isString(result.updated), 'has updated date')
	t.not(new Date(result.updated).toString(), 'Invalid Date', 'date is valid')
	t.true(_.isString(result.links.view), 'has links.view')
	t.true(_.isString(result.links.client_view), 'has links.client_view')
	t.true(_.isString(result.links.statement), 'has links.statement')
	t.is(result.contacts.length, 1, 'has one contact')
	t.is(result.contacts[0].email, 'j@example.com', 'contact has email')
})

test.serial('list', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.list()
	t.true(_.isArray(result.clients), 'has clients array')
	t.true(_.every(result.clients, _.isPlainObject), 'every client is an object')
	t.true(_.isInteger(result.page), 'page is an integer')
	t.true(_.isInteger(result.pages), 'pages is an integer')
	t.true(_.isInteger(result.total), 'total is an integer')
	t.true(_.isInteger(result.per_page), 'per_page is an integer')
})

test.serial('listAll', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.listAll()
	t.true(_.isArray(result), 'returns array')
	t.true(_.every(result, _.isPlainObject), 'every result inside array is an object')
})

test.serial('listAll empty results', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.listAll({email: '§_INVALID_EMAIL_§'})
	t.true(_.isArray(result), 'returns array')
	t.is(result.length, 0, 'array is empty')
})

test.serial('delete', async t => {
	const {client} = new FreshBooks(url, token)
	const result = await client.delete({client_id})
	t.true(result, 'returns true')

	const fn = () => client.get({client_id})
	const e = await t.throws(fn, `'client_id' not found. Client is deleted.`)
	t.is(e.code, 50010)
})

test('throw failures', async t => {
	const {client} = new FreshBooks(url, token)
	await Promise.all([
		async () => {
			const fn = () => client.get('')
			const e = await t.throws(fn, `Missing required field: 'client_id'.`)
			t.is(e.code, 40040)
		},
		async () => {
			const fn = () => client.get('a')
			const e = await t.throws(fn, `'client_id' not found. Client not found.`)
			t.is(e.code, 50010)
		},
	].map(fn => fn()))
})
