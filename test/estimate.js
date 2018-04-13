import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'
import FreshBooks from '..'

let client_id = 2
let estimate_id = null

const sum_lines = (total, line) => total + (line.unit_cost * line.quantity)
const lines = [
	{name: 'Test', unit_cost: 5, quantity: 5},
	{name: 'Test Big', unit_cost: 15, quantity: 3},
]
const amount = 70

test.serial('create', async t => {
	const {estimate} = new FreshBooks(url, token)
	estimate_id = await estimate.create({client_id})
	t.true(_.isInteger(estimate_id), 'returns estimate_id')
})

test.serial('update', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.update({estimate_id, notes: 'Lorem Ipsum'})
	t.true(result, 'returns true')
})

test.serial('get', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.get({estimate_id})

	t.is(result.status, 'draft', 'estimate is a draft')
	t.is(result.estimate_id, estimate_id, 'matches provided estimate_id')
	t.is(result.client_id, client_id, 'matches provided client_id')
	t.is(result.notes, 'Lorem Ipsum', 'matches provided notes')
	t.true(_.isString(result.date), 'has date')
	t.not(new Date(result.date).toString(), 'Invalid Date', 'date is valid')
	t.true(_.isFinite(result.amount), 'has finite amount')
	t.true(_.isFinite(result.discount), 'has finite discount')
	t.true(_.isString(result.links.view), 'has links.view')
	t.true(_.isString(result.links.client_view), 'has links.client_view')
})

test.serial('update lines', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.update({estimate_id, lines})
	t.true(result, 'returns true')
})

test.serial('get (direct selection)', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.get(estimate_id)

	t.is(result.status, 'draft', 'estimate is a draft')
	t.is(result.estimate_id, estimate_id, 'matches provided estimate_id')
	t.is(result.client_id, client_id, 'matches provided client_id')
	t.is(result.notes, 'Lorem Ipsum', 'matches provided notes')
	t.true(_.isArray(result.lines), 'lines is array')
	t.true(_.isMatch(result.lines, lines), 'lines match with provided')
	t.true(_.isString(result.date), 'has date')
	t.not(new Date(result.date).toString(), 'Invalid Date', 'date is valid')
	t.is(amount, result.amount, 'amount matches with lines')
	t.true(_.isFinite(result.discount), 'has finite discount')
	t.true(_.isString(result.links.view), 'has links.view')
	t.true(_.isString(result.links.client_view), 'has links.client_view')
})

test.serial('sendByEmail', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.sendByEmail({estimate_id})
	t.true(result, 'returns true')
})

test.serial('sendByEmail (direct selection)', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.sendByEmail(estimate_id)
	t.true(result, 'returns true')
})

test.serial('markAsSent', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.markAsSent({estimate_id})
	t.true(result, 'returns true')
})

test.serial('accept', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.accept({estimate_id})
	t.true(result, 'returns true')
})

test.serial('accept (direct selection)', async t => {
	const {estimate} = new FreshBooks(url, token)
	const fn = () => estimate.accept(estimate_id)
	const e = await t.throws(fn, 'Failed to accept estimate. Estimate is already accepted.')
	t.is(e.code, 50020)
})

test.serial('getPDF', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.getPDF({estimate_id})
	t.true(result instanceof Buffer, 'returns Buffer')
	const magic = result.toString('hex', 0, 4)
	t.is(magic, '25504446', 'returns PDF File')
})

test.serial('getPDF (direct selection)', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.getPDF(estimate_id)
	t.true(result instanceof Buffer, 'returns Buffer')
	const magic = result.toString('hex', 0, 4)
	t.is(magic, '25504446', 'returns PDF File')
})

test.serial('list', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.list()
	t.true(_.isArray(result.estimates), 'has estimates array')
	t.true(_.isInteger(result.page), 'page is an integer')
	t.true(_.isInteger(result.pages), 'pages is an integer')
	t.true(_.isInteger(result.total), 'total is an integer')
	t.true(_.isInteger(result.per_page), 'per_page is an integer')
})

test.serial('delete (direct selection)', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.delete(estimate_id)
	t.true(result, 'returns true')
})

test.serial('delete', async t => {
	const {estimate} = new FreshBooks(url, token)
	const fn = () => estimate.delete({estimate_id})
	const e = await t.throws(fn, `'estimate_id' not found. Estimate is deleted.`)
	t.is(e.code, 50010)
})

test('listAll', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.listAll()
	t.true(_.isArray(result), 'returns array')
	t.true(_.every(result, _.isPlainObject), 'every result inside array is an object')
})

test('throw failures', async t => {
	const {estimate} = new FreshBooks(url, token)
	await Promise.all([
		async () => {
			const fn = () => estimate.get('')
			const e = await t.throws(fn, `Missing required field: 'estimate_id'.`)
			t.is(e.code, 40040)
		},
		async () => {
			const fn = () => estimate.get('a')
			const e = await t.throws(fn, `'estimate_id' not found. Estimate not found.`)
			t.is(e.code, 50010)
		},
	].map(fn => fn()))
})
