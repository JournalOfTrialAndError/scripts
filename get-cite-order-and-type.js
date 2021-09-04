const fs = require('fs').promises

const safe = async (promise) => {
  try {
    const data = await promise
    return [data, null]
  } catch (e) {
    console.error(e)
    return [null, error]
  }
}

const getCites = (tex) => [...tex.matchAll(/\\(\w+)cite\{(.+?)\}/gm)]

const getBib = async (path) => {
  const [tex, error] = await safe(fs.readFile(path, { encoding: 'utf8' }))
  if (error) {
    return null
  }
  return tex
}
const getCiteOrderAndType = async (path) => {
  const tex = await getBib(path)
  const matches = getCites(tex)
  const cites = matches.map((entry) => ({ type: entry[1], cite: entry[2] }))
  return cites
}

module.exports = { getCiteOrderAndType: getCiteOrderAndType, getCites: getCites, getBib: getBib }
