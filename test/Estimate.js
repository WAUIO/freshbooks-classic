/* eslint-env mocha */

var assert = require('assert')
var FreshBooks = require('../')

describe('Estimate', () => {
	var freshbooks = new FreshBooks('https://freshbooksjs.freshbooks.com/api/2.1/xml-in', '59dbd7310470641ff2332bd016ac2e4e')
	var estimate = new freshbooks.Estimate()

	describe('create()', () => {
		it('should create a new estimate', function(done) {
			estimate.client_id = 2

			estimate.lines.push({
				name: 'Test',
				unit_cost: '5.00',
				quantity: '5',
				type: 'Item',
			})

			estimate.create(function(err, estimate) {
				done(err)
			})
		})
	})

	describe('update()', () => {
		it('should update an estimate', function(done) {
			estimate.notes = 'Lorem Ipsum'
			estimate.update(function(err, estimate) {
				done(err)
			})
		})
	})

	describe('get()', () => {
		it('should get an estimate', function(done) {
			estimate.get(estimate.estimate_id, function(err, estimate) {
				done(err)
			})
		})
	})

	describe('sendByEmail()', () => {
		it('should send an estimate by email', function(done) {
			estimate.sendByEmail(function(err, estimate) {
				done(err)
			})
		})
	})

	describe('list()', () => {
		it('should list an array of estimates', function(done) {
			estimate.list({client_id: estimate.client_id}, function(err, estimates) {
				done(err)
			})
		})
	})

	describe('delete()', () => {
		it('should delete an estimate', function(done) {
			estimate.delete(function(err, estimate) {
				done(err)
			})
		})
	})
})
