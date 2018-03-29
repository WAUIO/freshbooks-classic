import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'
import FreshBooks from '../lib'

test('estimates.create()', async t => {
	const {estimates} = new FreshBooks(url, token)
	const id = await estimates.create({client_id: 2})
	t.true(_.isInteger(id), 'returns estimate_id')
})
