# freshbooks-classic

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][codecov-badge]][codecov-url]

`freshbooks-classic` is a node.js module providing a wrapper to
the vintage version of [FreshBooks](http://www.freshbooks.com) API.

All API methods are documented at [FreshBooks](http://freshbooks.com/developers)
if you find any discrepancy between the docs and this wrapper feel free to file
an [Issue](https://github.com/leonardodino/freshbooks-classic/issues).

## Installation
```shell
$ npm install --save freshbooks-classic
```

or

```shell
$ yarn add freshbooks-classic
```

## Example
```javascript
const FreshBooks = require('freshbooks-classic')
const {invoice} = new FreshBooks(api_url, api_token)

(async () => {
  const {number} = await invoice.get(invoice_id)
  console.log(`Invoice Number: ${number}`)
})()
```

## Features / Goals
- no native modules.
- `async`/`await` friendly.
- must work on `browser`, `aws-lambda`, and `node v6`+.

## Credits
This library is a rewrite of the `freshbooks.js`,
written by [Marc Loney](https://github.com/marcloney/freshbooks.js), and forked
in 2015 by [Flow XO](https://github.com/flowxo/freshbooks.js).

## Implementation Roadmap
- [ ] `FreshBooks.category`
- [x] `FreshBooks.client`
- [x] `FreshBooks.estimate`
- [ ] `FreshBooks.expense`
- [ ] `FreshBooks.gateway`
- [ ] `FreshBooks.invoice`
- [ ] `FreshBooks.item`
- [x] `FreshBooks.languages`
- [ ] `FreshBooks.payment`
- [ ] `FreshBooks.project`
- [ ] `FreshBooks.recurring`
- [ ] `FreshBooks.staff`
- [ ] `FreshBooks.task`
- [ ] `FreshBooks.tax`
- [x] `FreshBooks.terms`
- [ ] `FreshBooks.timeEntry`
- [ ] cleanup excess obscurity

## License

(The MIT License)

Copyright (c) 2018 Leonardo Dino

Permission is hereby granted, free of charge, to any person obtaininga copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm-badge]: https://badge.fury.io/js/freshbooks-classic.svg
[npm-url]: https://www.npmjs.com/package/freshbooks-classic
[travis-badge]: https://travis-ci.org/leonardodino/freshbooks-classic.svg?branch=master
[travis-url]: https://travis-ci.org/leonardodino/freshbooks-classic
[codecov-badge]: https://codecov.io/gh/leonardodino/freshbooks-classic/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/leonardodino/freshbooks-classic
