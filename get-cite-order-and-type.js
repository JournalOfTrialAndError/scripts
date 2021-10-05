const fs = require('fs').promises
const getDate = require('./getDate')
const getOrigDate = require('./get-orig-date')

const safe = async (promise) => {
  try {
    const data = await promise
    return [data, null]
  } catch (e) {
    console.error(e)
    return [null, error]
  }
}

//const getCites = (tex) => [...tex.matchAll(/\\(\w+)cite\{(.+?)\}/gm)]
const getCites = (tex) => [...tex.matchAll(/\\citeyear.?\{(.+?)\}/gm)]

const getTex = async (path) => {
  const [tex, error] = await safe(fs.readFile(path, { encoding: 'utf8' }))
  if (error) {
    console.log(error)
    return error
  }
  return tex
}
const getBib = async (path) => {
  const [bib, error] = await safe(fs.readFile(path, { encoding: 'utf8' }))
  if (error) {
    return null
  }
  return bib
}

const getCiteOrderAndType = async (path, bibpath) => {
  const tex = await getTex(path)
  const bib = await getBib(bibpath)
  const matches = getCites(tex)
  const cites = matches.map((entry) => {
    const origDate= getOrigDate(bib, entry[1])
    const year= getDate(bib, entry[1])
    const ogDate = origDate ? `${origDate}/` : ''
  return `${ogDate}${year}`
  })
  return cites
    }

module.exports = { getCiteOrderAndType: getCiteOrderAndType, getCites: getCites, getTex: getTex, getBib: getBib }
