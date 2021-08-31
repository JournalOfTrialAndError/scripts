const { getDocxXml, convertTables, extractCites, convertReferences } = require('./cheerio')

test('should give tables', async () => {
  const $ = await getDocxXml('rosstest.docx')
  const tables = await convertTables($)
  await tables
  expect(!!tables.length).toEqual(true)
  expect(tables.length).toEqual(2)
})
