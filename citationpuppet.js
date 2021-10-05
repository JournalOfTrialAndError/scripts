const puppeteer = require('puppeteer')
const { getCiteOrderAndType } = require('./get-cite-order-and-type')

const secretpassword = require('./password')
const email = 'thomasfkjorna@gmail.com'
const loginSequence = require('./loginSequence')

const doCitations = async ({/*page,*/ /*navPromise,*/ loggedIn, texpath, bibpath, basepath, destination} ) => {
  const baseurl = basepath || 'https://openpresstiu.pubpub.org/'
  //  pages: ['https://openpresstiu.pubpub.org/pub/political-philosophy/release/2'],
  const tex = texpath ? texpath :  '1.tex'
  const bib = bibpath ? bibpath :  '1.bib'
  
	const login = !loggedIn || !page

  const browser = await puppeteer.launch({timeout: 120000, headless: false })
  const page = await browser.newPage()
  const navPromise = page.waitForNavigation()
  await loginSequence(basepath, email, secretpassword, page, navPromise)

  await navPromise
  await page.waitForTimeout(2000)
  await page.goto(destination)

  await navPromise


  const citeList = await getCiteOrderAndType(tex, bib)
  console.log(citeList)
  //we need to wait for it to connect
  await page.waitForTimeout(2000)
  await page.waitForSelector('[data-node-type="citation"]')
  const cit = await page.$$('[data-node-type="citation"]')
  if(cit.length !== citeList.length){
	  console.log("Yo, the citations don't matchup, might want to have a loook. This is probably because you dindnt get rid of a pdftooltip or smthn.")
  }
  for (let index = 0; index < cit.length; index++) {
    // citations = await page.$$('[data-node-type="citation"]')

    const citations = await page.$$('[data-node-type="citation"]')
    await page.waitForSelector('[data-node-type="citation"]')
    await citations[index].click()

    // if (citeList[index].type === 'paren') {
    //

    await page.waitForSelector(
      '.inner > .controls-citation-component > .preview > .bp3-control-group > .bp3-button > .bp3-icon-chevron-down',
    )
    // await page.keyboard.press('Tab')
    // await page.keyboard.press('Tab')
    // await page.keyboard.press('Tab')
    // await page.keyboard.press('Tab')
    // await page.keyboard.press('Tab')
    // await page.keyboard.press('Tab')
    // await page.keyboard.press('Enter')
    // await page.waitForTimeout(100)
    // await page.keyboard.press('ArrowDown')
    // await page.keyboard.press('Enter')
    // await page.keyboard.press('Escape')
    await page.click(
      '.inner > .controls-citation-component > .preview > .bp3-control-group > .bp3-button',
    )

    // await page.waitForSelector('.preview > .bp3-control-group > .bp3-button > .bp3-icon > svg')
    // await page.click('.preview > .bp3-control-group > .bp3-button > .bp3-icon > svg')
    // await page.waitForSelector('.__reakit-portal > ul:not(.hidden) > li:nth-child(2) > a > div')
    await page.$('.__reakit-portal > ul:not(.hidden) > li:nth-child(2) > a > div')

    //await page.waitForTimeout(1000)
    await page.click('.__reakit-portal > ul:not(.hidden) > li:nth-child(2) > a > div')

    await page.waitForSelector(
      '.controls-citation-component > .section > .bp3-control-group > .bp3-input-group > .bp3-input',
    )
    const inputField = await page.$(
      '.controls-citation-component > .section > .bp3-control-group > .bp3-input-group > .bp3-input',
    )

   // const text = await page.evaluate((element) => element.value, inputField)
   // console.log(text)
    console.log(citeList[index])
    console.log(citeList)
    const newText = citeList[index]
    console.log(newText)
    await page.click(
      '.controls-citation-component > .section > .bp3-control-group > .bp3-input-group > .bp3-input',
      {clickCount: 3})
    // for (char of text) {
    //   await page.keyboard.press('Backspace')
    // }
    await page.type(
      '.controls-citation-component > .section > .bp3-control-group > .bp3-input-group > .bp3-input',
      newText,
    )

    await page.keyboard.press('Escape')
    // await page.waitForSelector(
    //   '.inner > .controls-citation-component > .section > .controls-button-group > .controls-button',
    // )
    // await page.click(
    //   '.inner > .controls-citation-component > .section > .controls-button-group > .controls-button',
    // )
    await page.click('.side-content')
    // }
    // return
    //
  }
	console.log("HUP REFERENCES GO GO")
	await page.waitForTimeout(30000)
	
await	browser.close()

}
module.exports = doCitations
