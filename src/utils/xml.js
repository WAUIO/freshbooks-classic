import {parseStringSync} from 'xml2js-parser'
import xmlbuilder from 'xmlbuilder'

const PARSE_OPTIONS = {
	trim: true,
	explicitRoot: false,
	emptyTag: undefined,
	explicitArray: false,
	ignoreAttrs: true,
	mergeAttrs: true,
	valueProcessors: [
		xmlbuilder.processors.parseNumbers,
		xmlbuilder.processors.parseBooleans,
	]
}

export const parse = str => parseStringSync(str, PARSE_OPTIONS)
export const build = method => xmlbuilder.create('request', {method})


const xml = `
<?xml version="1.0" encoding="utf-8"?>
<response xmlns="https://www.freshbooks.com/api/" status="ok">
  <estimate_id>103</estimate_id>
</response>
`
console.log(parse(xml))
