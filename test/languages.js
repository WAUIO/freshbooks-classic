import _ from 'lodash'
import test from 'ava'
import {url, token} from './credentials.json'

import FreshBooks from '..'

test('list', async t => {
	const {languages} = new FreshBooks(url, token)
	const result = await languages.list()
	t.true(_.isPlainObject(result), 'returns plain languages object')
	t.true(_.every(result, _.isString), 'values are strings')
	t.is(result.en, 'English', 'correctly maps code to name')
})
