import {Buffer} from 'safe-buffer'
import {parse} from 'url'
import https from 'https'
import * as XML from '../utils/xml'

// const XMLNS = 'http://www.freshbooks.com/api/'

export default class FreshBooksFetch {
	constructor({url, token}){
		this.url = {
			host: parse(url).hostname,
			port: parse(url).port,
			path: parse(url).path,
		}
		this.token = token
		this.post = this.post.bind(this)
	}
	post(xml, {raw} = {}){
		return new Promise((resolve, reject) => {
			const string = xml.toString()

			const options = {
				...this.url,
				method: 'POST',
				headers: {
					'Content-Length': Buffer.byteLength(string, 'utf8'),
					Authorization: `Basic ${Buffer.from(`${this.token}:X`).toString('base64')}`,
				},
			}

			var req = https.request(options, res => {
				if(res.statusCode >= 400) return reject(new Error(`HTTPS: ${res.statusCode}`))
				const data = []
				if(!raw) res.setEncoding('utf8')
				res.on('data', chunk => data.push(chunk))
				res.on('end', () => {
					if(raw) return resolve(Buffer.concat(data))
					try{
						const str = data.join('')
						const obj = XML.parse(str)
						if(obj.status === 'ok') return resolve(obj)
						const err = new Error(obj.error || 'invalid freshbooks response')
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
