const getDate = (bib, key) => {
  const reg = new RegExp(`${key},[^\@]+(?<!orig)date ?= ?\{(.+?)\}`, 'gms')
  const keyy = [...bib.matchAll(reg)]
  const entry = keyy.length && keyy[0][1]
  return entry
}

module.exports = getDate
