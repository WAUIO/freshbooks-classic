import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'
import FreshBooks from '../lib'

test('estimate.create()', async t => {
	const {estimate} = new FreshBooks(url, token)
	const id = await estimate.create({client_id: 2})
	t.true(_.isInteger(id), 'returns estimate_id')
})
