/* eslint-env mocha */

var assert = require('assert')
var FreshBooks = require('../')

describe('Invoice', () => {
	var freshbooks = new FreshBooks('https://freshbooksjs.freshbooks.com/api/2.1/xml-in', '59dbd7310470641ff2332bd016ac2e4e')
	var invoice = new freshbooks.Invoice()

	describe('create()', () => {
		it('should create a new invoice', function(done) {
			invoice.client_id = 2

			invoice.lines.push({
				name: 'Test',
				unit_cost: '5.00',
				quantity: '5',
				type: 'Item',
			})

			invoice.create(function(err, invoice) {
				done(err)
			})
		})
	})

	describe('update()', () => {
		it('should update an invoice', function(done) {
			var invoiceId = invoice.invoice_id

			var updatingInvoice = new freshbooks.Invoice()
			updatingInvoice.invoice_id = invoiceId
			updatingInvoice.notes = 'Lorem Ipsum'
			updatingInvoice.update(function(err, invoice) {
				done(err)
			})
		})
	})

	describe('update()', () => {
		it('should update an invoice with 2 bytes (or more) chars', function(done) {
			var invoiceId = invoice.invoice_id

			var updatingInvoice = new freshbooks.Invoice()
			updatingInvoice.invoice_id = invoiceId
			updatingInvoice.notes = '!?%€$ éèîàü  ﷰ Подтверждение 賬戶驗證'
			updatingInvoice.update(function(err, invoice) {
				done(err)
			})
		})
	})

	describe('get()', () => {
		it('should get an invoice', function(done) {
			invoice.get(invoice.invoice_id, function(err, invoice) {
				done(err)
			})
		})
	})

	describe('sendByEmail()', () => {
		it('should send an invoice by email', function(done) {
			invoice.sendByEmail(function(err, invoice) {
				done(err)
			})
		})
	})

	describe('list()', () => {
		it('should list an array of invoices', function(done) {
			invoice.list({client_id: invoice.client_id}, function(err, invoices) {
				done(err)
			})
		})
	})

	describe('delete()', () => {
		it('should delete an invoice', function(done) {
			invoice.delete(function(err, invoice) {
				done(err)
			})
		})
	})
})
