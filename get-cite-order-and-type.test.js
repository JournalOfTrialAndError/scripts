const { getCiteOrderAndType, getCites, getTex, getBib } = require('./get-cite-order-and-type')

const testTex = '/home/thomas/COTE/Tilburg/tex/book/pub/1.tex'
const testBib = '/home/thomas/COTE/Tilburg/bibs/1.bib'

const textCite = '\\textcite{jemama3432}'
const parenCite = '\\parencite{mo2342}'
test('should match \\*cite', async () => {
  const tex = await getTex(testTex)
  const parenCites = getCites(tex)
  expect(!!parenCites.length).toEqual(true)
})

test('should get citations', async () => {
  const tex = await getTex(testTex)
  const bib = await getBib(testBib)
  const cites = getCites(tex)
  expect(!!cites.length).toEqual(true)
})

test('should return list', async () => {
  const obj = await getCiteOrderAndType(testTex, testBib)
  console.log(obj)
  expect(!!obj.length).toEqual(true)
  expect(obj.some(k=>{
    console.log(k)
    return k && [...k.matchAll(/[a-z]/g)].length})
        ).toEqual(false)
  expect(obj.every(k=>{
   const aaa=  [...k.matchAll(/(.+?)\/(.+?)/g)]
    if(!aaa.length){
      return true
    }
    return aaa[0][1]!==aaa[0][2]
  })).toEqual(true)
})
