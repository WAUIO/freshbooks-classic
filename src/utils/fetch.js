import {Buffer} from 'safe-buffer'
import url from 'url'
import https from 'https'
import * as XML from '../utils/xml'

const XMLNS = 'http://www.freshbooks.com/api/'

class FreshBooksFetch {
	constructor({url, token, xmlns}){
		this.url = {
			host: url.parse(this.url).hostname,
			port: url.parse(this.url).port,
			path: url.parse(this.url).path,
		}
		this.token = token
		this.xmlns = xmlns
		this.post = this.post.bind(this)
	}
	post(xml){
		return new Promise((resolve, reject) => {
			const string = xml.toString()

			const options = {
				url: this.url,
				method: 'POST',
				headers: {
					'Content-Length': Buffer.byteLength(string, 'utf8'),
					Authorization: `Basic ${Buffer.from(`${this.token}:X`).toString('base64')}`,
				},
			}

			var req = https.request(options, res => {
				let str = ''
				res.setEncoding('utf8')
				res.on('data', chunk => {
					str += chunk
				})
				res.on('end', () => {
					try{
						const obj = XML.parse(str)
						if(obj.status === 'ok') return resolve(obj)
						const err = new Error(obj.error)
						err.code = obj.code
						throw err
					}catch (e){
						return reject(e)
					}
				})
			})
			req.on('error', err => {
				return reject(new Error(`CANNOT CONNECT TO FRESHBOOKS: ${err.message}`))
			})
			req.write(string)
			req.end()
		})
	}
}
