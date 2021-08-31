const Cite = require('citation-js')

const addFullCite = (text, bib) => {
  const cite = new Cite(bib)
  const bibarray = cite.format('bibliography').split('\n')
  const bibl = bibarray.filter((e) => e)

  const keys = cite.format('data', { format: 'object' })
  console.log(bibl)
  const complete = bibl.reduce((acc, entry, index) => {
    return {
      ...acc,
      [keys[index].id]: entry,
    }
  }, {})
  console.log(complete)

  const cleanCites = text.replaceAll(/\\citeyear\{.+?\s([\w\.\d]+)\}/gm, '\\citeyear{$1}')
  return cleanCites.replaceAll(
    /\\fullcite\{(\w+\s)*(.+?)\}/gm,
    (string, whatever, match) => complete[match],
  )
}

module.exports = addFullCite
