/* eslint-env mocha */

var assert = require('assert')
var FreshBooks = require('../')

describe('Payment', () => {
	var freshbooks = new FreshBooks('https://freshbooksjs.freshbooks.com/api/2.1/xml-in', '59dbd7310470641ff2332bd016ac2e4e')
	var payment = new freshbooks.Payment()

	describe('create()', () => {
		it('should create a new payment', function(done) {
			payment.client_id = 2
			payment.amount = '20.00'

			payment.create(function(err, payment) {
				done(err)
			})
		})
	})

	describe('update()', () => {
		it('should update a payment', function(done) {
			payment.amount = '25.00'

			payment.update(function(err, payment) {
				done(err)
			})
		})
	})

	describe('get()', () => {
		it('should get a payment', function(done) {
			payment.get(payment.payment_id, function(err, payment) {
				done(err)
			})
		})
	})

	describe('list()', () => {
		it('should list an array of payments', function(done) {
			payment.list(function(err, payments) {
				done(err)
			})
		})
	})

	describe('delete()', () => {
		it('should delete a payment', function(done) {
			payment.delete(function(err, payment) {
				done(err)
			})
		})
	})
})
