/* eslint-env mocha */

var assert = require('assert')
var FreshBooks = require('../')

describe('Staff', () => {
	var freshbooks = new FreshBooks('https://freshbooksjs.freshbooks.com/api/2.1/xml-in', '59dbd7310470641ff2332bd016ac2e4e')
	var staff = new freshbooks.Staff()

	describe('current()', () => {
		it('should return current staff member', function(done) {
			staff.current(function(err, staff) {
				done(err)
			})
		})
	})

	describe('get()', () => {
		it('should get an staff', function(done) {
			staff.get(staff.staff_id, function(err, staff) {
				done(err)
			})
		})
	})

	describe('list()', () => {
		it('should list an array of staffs', function(done) {
			staff.list(function(err, staffs) {
				done(err)
			})
		})
	})
})
