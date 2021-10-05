const getCorrectKey = (bib, key) => {
  try {
    const stsht = new RegExp(`${key}`, 'gms')
  } catch (e) {
    return key
  }
  const date = key.replaceAll(/[^\d]/g, '')
  const keyReg = new RegExp(`${key}`, 'gms')
  if (date && [...bib.matchAll(keyReg)].length !== 0) {
    return key
  }
  const reasonableKey = key.replaceAll(/[\-\d\ \(\)\}\{]/g, '')
  const lookingForUnique = new RegExp(`\\@\\w+\\{(${reasonableKey}\\d*),[^\@]+`, 'gms')
  const maybeUnique = [...bib.matchAll(lookingForUnique)]
  if (maybeUnique.length === 1 && maybeUnique[0][1] !== key) {
    return maybeUnique[0][1]
  }
  const lookingForOg = new RegExp(
    `\\@\\w+\\{(${reasonableKey}\\d*),[^\\@]+origdate ?= ?\\{${date}\\}`,
    'gms',
  )
  const og = [...bib.matchAll(lookingForOg)]
  if (og.length === 1) {
    return og[0][1]
  }
  return key
}

module.exports = getCorrectKey
