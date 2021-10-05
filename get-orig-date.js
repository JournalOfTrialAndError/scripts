const getOrigDate = (bib, key) => {
  const reg = new RegExp(`${key},[^\@]+origdate ?= ?\{(.+?)\}`, 'gms')
  const keyy = [...bib.matchAll(reg)]
  const entry = keyy.length && keyy[0][1]
  const gooded = entry && entry.includes('-') ? entry.replaceAll(/\-0(\d+)\~?/g, (str, num) => `${num -1} B.C.E.`) : entry
  return gooded
}

module.exports = getOrigDate
