const puppeteer = require('puppeteer')
const secretpassword = require('./password')
const doCitations = require('./citationpuppet')
const { program } = require('commander')
const metadata = require('/home/thomas/COTE/Tilburg/metadata')
const input = {
  baseurl: 'https://openpresstiu.pubpub.org/',
  pages: ['https://openpresstiu.pubpub.org/pub/political-philosophy/release/2'],
  tex: ['/home/thomas/COTE/Tilburg/tex/2.tex'],
  bib: ['/home/thomas/COTE/Tilburg/bibs/2.bib'],
  doi: ['eee'],
  author: [
    [{ name: 'Author', affiliation: 'Tilburg University', orcid: 'ashtas', email: 'asht@asht.nl' }],
  ],
  title: ['Justice Bad'],
  description: ['An introduction to...'],
  pdf: [''],
  shorttitle: ['cartesianminds'],
}
const email = 'thomasfkjorna@gmail.com'
const loginSequence = require('./loginSequence')
const puppet = async ({bib, tex, doi, author, title, subtitle, pdf, shorttile}) => {
  const browser = await puppeteer.launch({ headless: false})
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation()

  await loginSequence(input.baseurl, email, secretpassword, page, navigationPromise)
  await navigationPromise

  if (!input.pages.length) {
    console.log("You didn't give me any pages to click on, please do so.")
    return
  }

  await navigationPromise
  for (let index = 0; index < input.pages.length; index++) {
    await navigationPromise
    await page.waitForSelector(
      '.row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(1):not([href])',
    )
    await page.click(
      '.row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(1) > .bp3-button-text',
    )

    await navigationPromise

    await page.waitForSelector(
      '.small-header-button-component > .pub-header-themed-box > .bp3-icon-cog > svg > path',
    )
    await page.click(
      '.small-header-button-component > .pub-header-themed-box > .bp3-icon-cog > svg > path',
    )

    await navigationPromise

    await page.waitForSelector('#input-Title')
    await page.click('#input-Title')

    await page.waitForSelector('#input-Link')
    await page.click('#input-Link')

    await page.waitForSelector(
      '#license > .content > .bp3-popover-wrapper > .bp3-popover-target > .bp3-button',
    )
    await page.click(
      '#license > .content > .bp3-popover-wrapper > .bp3-popover-target > .bp3-button',
    )

    await page.waitForSelector(
      'li:nth-child(5) > .bp3-menu-item > .bp3-text-overflow-ellipsis > div > .title',
    )
    await page.click(
      'li:nth-child(5) > .bp3-menu-item > .bp3-text-overflow-ellipsis > div > .title',
    )
    // Click CC box
await page.waitForSelector('.bp3-popover-wrapper > .bp3-popover-target > .bp3-button > .bp3-icon-caret-down > svg')
await page.click('.bp3-popover-wrapper > .bp3-popover-target > .bp3-button > .bp3-icon-caret-down > svg')

    //Select license
await page.waitForSelector('li:nth-child(5) > .bp3-menu-item > .bp3-text-overflow-ellipsis > div > .full')
await page.click('li:nth-child(5) > .bp3-menu-item > .bp3-text-overflow-ellipsis > div > .full')

    // Click apa box
await page.waitForSelector('.input-field-component:nth-child(1) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button > .bp3-icon > svg > path')
await page.click('.input-field-component:nth-child(1) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button > .bp3-icon > svg > path')
    await page.waitForTimeout(200)

    //secelt apa 7
await page.waitForSelector('div > .bp3-menu > li:nth-child(4) > .bp3-menu-item > .bp3-text-overflow-ellipsis')
await page.click('div > .bp3-menu > li:nth-child(4) > .bp3-menu-item > .bp3-text-overflow-ellipsis')

    //click on cite style
await page.waitForSelector('.input-field-component:nth-child(2) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button > .bp3-icon > svg')
await page.click('.input-field-component:nth-child(2) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button > .bp3-icon > svg')

    //select author year
await page.waitForSelector('li:nth-child(2) > .bp3-menu-item > .bp3-text-overflow-ellipsis > span > .cite-example')
await page.click('li:nth-child(2) > .bp3-menu-item > .bp3-text-overflow-ellipsis > span > .cite-example')

  //click on doi
await page.waitForSelector('.pub-settings-container_doi-component > .bp3-form-group > .bp3-form-content > .bp3-input-group > .bp3-input')
await page.click('.pub-settings-container_doi-component > .bp3-form-group > .bp3-form-content > .bp3-input-group > .bp3-input')

    //remove yourself
await page.waitForSelector('.drag-container > .attribution-row > .bp3-button > .bp3-icon > svg')
await page.click('.drag-container > .attribution-row > .bp3-button > .bp3-icon > svg')

    // toggle refs
await page.waitForSelector('#block-labels > .content > .node-label-editor-component > .bp3-control > .bp3-control-indicator')
await page.click('#block-labels > .content > .node-label-editor-component > .bp3-control > .bp3-control-indicator')

    //click on figure
await page.waitForSelector('#input-undefined')
await page.click('#input-undefined', {clickCount: 3})
    await page.type('#input-undefined', "Figure")

await page.waitForSelector('#input-Title')
    await page.click('#input-Title', {clickCount: 3})
await page.type('#input-Title', `${tex}`)

await page.waitForSelector('#input-Link')
await page.click('#input-Link')
//await page.type('#input-Link', 'liinky')


await page.waitForSelector('#input-Description')
await page.click('#input-Description')
    await page.type('#input-Description', "A reflection on wasting your time")


    // await page.waitForSelector(
    //   '.input-field-component:nth-child(1) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button',
    // )
    // await page.click(
    //   '.input-field-component:nth-child(1) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button',
    // )

    // await page.waitForSelector(
    //   '.theme-picker-component > .section > .section-row > .text-style-choice > .white-blocks',
    // )
    // await page.click(
    //   '.theme-picker-component > .section > .section-row > .text-style-choice > .white-blocks',
    // )

    // await page.waitForSelector(
    //   '.bp3-popover-wrapper > .bp3-popover-target > .tint-choice > .example > .inner',
    // )
    // await page.click(
    //   '.bp3-popover-wrapper > .bp3-popover-target > .tint-choice > .example > .inner',
    // )

    // await page.waitForSelector('.sketch-picker > .flexbox-fix > div:nth-child(5) > div > input')
    // await page.click('.sketch-picker > .flexbox-fix > div:nth-child(5) > div > input')
    // await page.keyboard.down('ControlLeft')
    // await page.keyboard.press('RightArrow')
    // await page.keyboard.press('BackSpace')
    // await page.keyboard.up('ControlLeft')
    // await page.type('.sketch-picker > .flexbox-fix > div:nth-child(5) > div > input', '0')

    // await page.waitForSelector(
    //   '#root > #app > #main-content > .dashboard-settings-container > .pub-settings-container',
    // )
    // await page.click(
    //   '#root > #app > #main-content > .dashboard-settings-container > .pub-settings-container',
    // )

    // await page.waitForSelector(
    //   '.dashboard-content-header > .dashboard-header-right > .controls > .bp3-button > .bp3-button-text',
    // )
    // await page.click(
    //   '.dashboard-content-header > .dashboard-header-right > .controls > .bp3-button > .bp3-button-text',
    // )

    // await page.waitForSelector(
    //   '#block-labels > .content > .node-label-editor-component > .bp3-control > .bp3-control-indicator',
    // )
    // await page.click(
    //   '#block-labels > .content > .node-label-editor-component > .bp3-control > .bp3-control-indicator',
    // )

    // await page.waitForSelector('#input-undefined')
    // await page.click('#input-undefined')

    // await page.keyboard.down('ControlLeft')
    // await page.keyboard.press('RightArrow')
    // await page.keyboard.press('BackSpace')
    // await page.keyboard.up('ControlLeft')
    // await page.type('#input-undefined', 'Figure')
    //
    await page.waitForSelector('.dashboard-content-header > .dashboard-header-right > .controls > .bp3-button > .bp3-button-text')

await page.click('.dashboard-content-header > .dashboard-header-right > .controls > .bp3-button > .bp3-button-text')

    await page.waitForSelector(
      '.breadcrumbs-component > .breadcrumbs-content > .breadcrumb-actions > .bp3-button > .bp3-button-text',
    )
    await page.click(
      '.breadcrumbs-component > .breadcrumbs-content > .breadcrumb-actions > .bp3-button > .bp3-button-text',
    )

    await navigationPromise

    page.waitForTimeout(2000)
    await page.waitForSelector(
      '.pub-document-component > .pub-grid > .main-content > .pub-file-import-component > .bp3-button',
    )
    await page.click(
      '.pub-document-component > .pub-grid > .main-content > .pub-file-import-component > .bp3-button',
    )
    page.waitForTimeout(500)
    await page.waitForSelector(
      '.bp3-drawer > .bp3-drawer-body > .bp3-dialog-body > .bp3-button-group > .file-drop-area',
    )
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click(
        '.bp3-drawer > .bp3-drawer-body > .bp3-dialog-body > .bp3-button-group > .file-drop-area',
      ),
    ])

    await fileChooser.accept([tex, bib])

    await page.waitForSelector('.file-progress > .bp3-icon-tick')
    // TODO proper timeout
    console.log('Imma waiting')
    await page.waitForTimeout(2000)

await page.waitForSelector('.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button:nth-child(2) > .bp3-button-text')
    console.log('Imma clicking')
await page.click('.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button:nth-child(2) > .bp3-button-text')


    await page.waitForSelector('.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button > .bp3-icon-tick')
    await page.waitForTimeout(2000)
    console.log('Imma clicking')
    await page.click('.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button > .bp3-icon-tick')

    await page.waitForSelector('[data-node-type="citation"]')
   await doCitations(page, navigationPromise, false, tex, bib, input.baseurl)
    //await page.click('[data-node-type="citation"]')
  }

  await browser.close()
}

//;(async ()=>{
//  for(let i=0; i < Object.keys(metadata).length; i++){
//    const {doi, auth, title, subtitle, pdf, image} = metadata
 //   puppet(`/home/thomas/COTE/Tilburg/tex/book/pub/${i}.tex)`,`/home/thomas/COTE/Tilburg/bibs/${i}.bib)`, doi, auth, title, subtitle, `/home/thomas/COTE/Tilburg/${i}.pdf`, `/home/thomas/COTE/Tilburg/`
//
//  }
//}())

module.exports = puppet
