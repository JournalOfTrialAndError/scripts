const { getCiteOrderAndType, getCites, getBib } = require('./get-cite-order-and-type')

const testTex = '/home/thomas/COTE/Tilburg/tex/2.tex'

const textCite = '\\textcite{jemama3432}'
const parenCite = '\\parencite{mo2342}'
test('should match \\*cite', () => {
  const textCites = getCites(textCite)
  console.log(textCites)
  const parenCites = getCites(parenCite)
  expect(textCites[0][1]).toEqual('text')
  expect(!!parenCites.length).toEqual(true)
})

test('should get citations', async () => {
  const tex = await getBib(testTex)
  const cites = getCites(tex)
  expect(!!cites.length).toEqual(true)
})

test('should return list', async () => {
  const obj = await getCiteOrderAndType(testTex)
  const keys = obj.map((match) => [match.type, match.cite])
  expect(keys.some((k) => k.length !== 2)).toEqual(false)
})
