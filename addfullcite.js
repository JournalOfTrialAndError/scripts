const Cite = require('citation-js')
const getOrigDate = require('./get-orig-date')

const addFullCite = (text, bib) => {
  const cite = new Cite(bib)
  const bibarray = cite.format('bibliography').split('\n')
  const bibl = bibarray.filter((e) => e)

  const keys = cite.format('data', { format: 'object' })
  const complete = bibl.reduce((acc, entry, index) => {
    const originalDate = getOrigDate(bib, keys[index].id)
    const orig = originalDate ? ` Original work published ${originalDate}` : ''
    return {
      ...acc,
      [keys[index].id]: `${entry}${orig}`,
    }
  }, {})

  const cleanCites = text.replaceAll(/\\citeyear\{(\w+\s)?([\w\.\d]+?)\}/gm, '\\citeyear{$2}')
  return cleanCites.replaceAll(/\\fullcite\{(\w+\s)*(.+?)\}/gm, (string, whatever, match) => {
    return complete[match] || string
  })
}

module.exports = addFullCite
