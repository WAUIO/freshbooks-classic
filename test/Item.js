/* eslint-env mocha */

var assert = require('assert')
var FreshBooks = require('../')

describe('Item', () => {
	var freshbooks = new FreshBooks('https://freshbooksjs.freshbooks.com/api/2.1/xml-in', '59dbd7310470641ff2332bd016ac2e4e')
	var item = new freshbooks.Item()

	describe('create()', () => {
		it('should create a new item', function(done) {
			item.name = 'Test Item' + Math.random()

			item.create(function(err, item) {
				done(err)
			})
		})
	})

	describe('update()', () => {
		it('should update an item', function(done) {
			item.description = 'Test Item'

			item.update(function(err, item) {
				done(err)
			})
		})
	})

	describe('get()', () => {
		it('should get an item', function(done) {
			item.get(item.item_id, function(err, item) {
				done(err)
			})
		})
	})

	describe('list()', () => {
		it('should list an array of items', function(done) {
			item.list(function(err, items) {
				done(err)
			})
		})
	})

	describe('delete()', () => {
		it('should delete an item', function(done) {
			item.delete(function(err, item) {
				done(err)
			})
		})
	})
})
