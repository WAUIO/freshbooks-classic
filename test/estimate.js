import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'
import FreshBooks from '../lib'

let client_id = 2
let estimate_id = null


test.serial('estimate.create', async t => {
	const {estimate} = new FreshBooks(url, token)
	estimate_id = await estimate.create({client_id})
	t.true(_.isInteger(estimate_id), 'returns estimate_id')
})

test.serial('estimate.update', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.update({estimate_id, notes: 'Lorem Ipsum'})
	t.true(result, 'returns true')
})

test.serial('estimate.get', async t => {
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

test.serial('estimate.get (direct selection)', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.get(estimate_id)

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

test.serial('estimate.sendByEmail', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.sendByEmail({estimate_id})
	t.true(result, 'returns true')
})

test.serial('estimate.markAsSent', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.markAsSent({estimate_id})
	t.true(result, 'returns true')
})

test.serial('estimate.accept', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.accept({estimate_id})
	t.true(result, 'returns true')
})

test.serial('estimate.getPDF', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.getPDF({estimate_id})
	t.true(result instanceof Buffer, 'returns Buffer')
	const magic = result.toString('hex', 0, 4)
	t.is(magic, '25504446', 'returns PDF File')
})

test.serial('estimate.list', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.list()
	t.true(_.isArray(result.estimates), 'has estimates array')
	t.true(_.isInteger(result.page), 'page is an integer')
	t.true(_.isInteger(result.pages), 'pages is an integer')
	t.true(_.isInteger(result.total), 'total is an integer')
	t.true(_.isInteger(result.per_page), 'per_page is an integer')
})

test.serial('estimate.delete', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.delete({estimate_id})
	t.true(result, 'returns true')
})

test.serial('estimate.listAll', async t => {
	const {estimate} = new FreshBooks(url, token)
	const result = await estimate.listAll()
	t.true(_.isArray(result), 'returns array')
	t.true(_.every(result, _.isPlainObject), 'every result inside array is an object')
})
