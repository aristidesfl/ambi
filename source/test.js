// The below eslint rules are disabled as they are more around how our tests are formatted
/* eslint no-magic-numbers:0, no-unused-vars:0, handle-callback-err:0, no-console:0, prefer-rest-params:0 */

// Import
const {equal} = require('assert-helpers')
const joe = require('joe')
const ambi = require('../')

// Prepare
function wait (delay, fn) {
	return setTimeout(fn, delay)
}
const delay = 100


// =====================================
// Tests

joe.describe('ambi', function (describe, it) {
	it('should handle result on successful synchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Perform multiply on a synchronous function
		// by return
		function multiplySync (x, y) {
			equal(arguments.length, 2, 'arguments length')
			++executedChecks
			return x * y
		}

		// Test successful call
		ambi(multiplySync, 2, 5, function (err, result) {
			equal(err, null, 'error to be null')
			equal(result, 10, 'result to be set')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should handle result on successful asynchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Perform multiply on an asynchronous function
		// by callback
		function multiplyAsync (x, y, next) {
			wait(delay, function () {
				next(null, x * y)
				++executedChecks
			})
			return 'async'
		}

		// Test successful call
		ambi(multiplyAsync, 2, 5, function (err, result) {
			equal(err, null, 'error to be null')
			equal(result, 10, 'result to be set')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should handle result on successful asynchronous function with optional arguments', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Perform multiply on an asynchronous function
		// by callback
		function multiplyAsync (x, y, next) {
			equal(typeof x, 'undefined', 'x to be undefined')
			equal(typeof y, 'undefined', 'y to be undefined')
			x = x || 3
			y = y || 5
			wait(delay, function () {
				next(null, x * y)
				++executedChecks
			})
			return 'async'
		}

		// Test successful call
		ambi(multiplyAsync, function (err, result) {
			equal(err, null, 'error to be null')
			equal(result, 15, 'result to be set')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should handle returned errors on unsuccessful synchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Define the error to be used
		const errMessage = 'my first error'

		// Perform an error on a synchronous function
		// by return
		function returnErrorSync (x, y) {
			++executedChecks
			return new Error(errMessage)
		}

		// Test unsuccessful call
		ambi(returnErrorSync, 2, 5, function (err, result) {
			equal(err.message, errMessage, 'error to be set')
			equal(typeof result, 'undefined', 'result to be undefined')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should handle callbacked errors on unsuccessful asynchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Define the error to be used
		const errMessage = 'my first error'

		// Perform an error on an asynchronous function
		// by callback
		function callbackErrorAsync (x, y, next) {
			wait(delay, function () {
				next(new Error(errMessage))
				++executedChecks
			})
			return 'async'
		}

		// Test unsuccessful call
		ambi(callbackErrorAsync, 2, 5, function (err, result) {
			equal(err.message, errMessage, 'error to be set')
			equal(typeof result, 'undefined', 'result to be undefined')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should ignore returned errors on successfull asynchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Define the error to be used
		const errMessage = 'my first error'

		// Perform an error on an asynchronous function
		// by return
		// and never calling the callback
		function returnErrorThenCompleteAsync (x, y, next) {
			wait(delay, function () {
				next(null, x * y)
				++executedChecks
			})
			return new Error(errMessage)
		}

		// Test successfull call
		ambi(returnErrorThenCompleteAsync, 2, 5, function (err, result) {
			equal(err, null, 'error to be null')
			equal(result, 10, 'result to be set')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should ignore returned errors on unsuccessful asynchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2

		// Define the error to be used
		const errMessage = 'my first error'
		const errMessage2 = 'my second error'

		// Perform an error on an asynchronous function
		// by return
		// and never calling the callback
		function returnErrorThenCallbackErrorAsync (x, y, next) {
			wait(delay, function () {
				next(new Error(errMessage2))
				++executedChecks
			})
			return new Error(errMessage)
		}

		// Test unsuccessful error call
		ambi(returnErrorThenCallbackErrorAsync, 2, 5, function (err, result) {
			equal(err.message, errMessage2, 'error to be set')
			equal(typeof result, 'undefined', 'result to be undefined')
			++executedChecks
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			done()
		})
	})

	it('should NOT handle thrown errors on unsuccessful synchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2
		let neverReached = false

		// Define the error to be used
		const errMessage = 'my first error'

		// Perform an error on a synchronous function
		// by throw
		function throwErrorSyncUncaught (x, y) {
			++executedChecks
			throw new Error(errMessage)
		}

		// Error callback
		function catchUncaughtException (err) {
			equal(err.message, errMessage, 'error to be set')
			++executedChecks
		}

		// Test unsuccessful call
		try {
			ambi(throwErrorSyncUncaught, 2, 5, function (err, result) {
				// should never reach here
				++executedChecks
				neverReached = true
			})
		}
		catch ( err ) {
			catchUncaughtException(err)
		}

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			equal(neverReached, false, 'never reached section should have never been reached')
			done()
		})
	})

	it('should NOT handle thrown errors on unsuccessful asynchronous functions', function (done) {
		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2
		let neverReached = false

		// Define the error to be used
		const errMessage = 'my first error'

		// Perform an error on a synchronous function
		// by throw
		// and never calling the callback
		function throwErrorAsyncUncaught (x, y, next) {
			++executedChecks
			throw new Error(errMessage)
		}

		// Error callback
		function catchUncaughtException (err) {
			equal(err.message, errMessage, 'error to be set')
			++executedChecks
		}

		// Test unsuccessful call
		try {
			ambi(throwErrorAsyncUncaught, 2, 5, function (err, result) {
				// should never reach here
				++executedChecks
				neverReached = true
			})
		}
		catch ( err ) {
			catchUncaughtException(err)
		}

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			equal(neverReached, false, 'never reached section should have never been reached')
			done()
		})
	})

	it('should NOT handle asynchronous thrown errors on unsuccessful asynchronous functions', function (done) {
		// Check node version
		if ( process.versions.node.substr(0, 3) === '0.8' ) {
			console.log('skip this test on node 0.8 because domains behave differently')
			return done()
		}

		// Define the amount of special checks
		let executedChecks = 0
		const totalChecks = 2
		let neverReached = false

		// Define the error to be used
		const errMessage = 'my first error'

		// Perform an error on an asynchronous function
		// by throw inside asynchronous function
		// and still calling the callback with the error
		function throwErrorAsyncUncaught (x, y, next) {
			wait(delay, function () {
				++executedChecks
				throw new Error(errMessage)
			})
			return 'async'
		}

		// Error callback
		function catchUncaughtException (err) {
			equal(err.message, errMessage, 'error to be set')
			++executedChecks
		}

		// Test unsuccessful call
		const d = require('domain').create()
		d.on('error', catchUncaughtException)
		d.run(function () {
			try {
				ambi(throwErrorAsyncUncaught, 2, 5, function (err, result) {
					// should never reach here
					++executedChecks
					neverReached = true
				})
			}
			catch ( err ) {
				catchUncaughtException(err)
			}
		})

		// Check all the special checks passed
		wait(delay * 2, function () {
			equal(executedChecks, totalChecks, 'special checks were as expected')
			equal(neverReached, false, 'never reached section should have never been reached')
			done()
		})
	})
})
