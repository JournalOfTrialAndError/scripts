const puppeteer = require('puppeteer')
const browser = await puppeteer.launch()
const page = await browser.newPage()
const navigationPromise = page.waitForNavigation()

await page.goto('https://openpresstiu.pubpub.org/')

await page.setViewport({ width: 2680, height: 1175 })

await navigationPromise

await page.waitForSelector(
  '.row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(3) > .bp3-button-text',
)
await page.click('.row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(3) > .bp3-button-text')

await navigationPromise

await page.waitForSelector('#input-Email')
await page.click('#input-Email')

await page.type('#input-Email', 'thomasfkjorna@gmail.com')

await page.waitForSelector('#input-Password')
await page.click('#input-Password')

await page.waitForSelector(
  'form > .input-field-component > .bp3-form-content > .bp3-button > .bp3-button-text',
)
await page.click(
  'form > .input-field-component > .bp3-form-content > .bp3-button > .bp3-button-text',
)

await navigationPromise

await page.waitForSelector('.col-12 > .scrollable-nav > .nav-list > .dropdown > .title')
await page.click('.col-12 > .scrollable-nav > .nav-list > .dropdown > .title')

await page.waitForSelector(
  '.__reakit-portal > #id-6 > #id-6-1 > .bp3-menu-item > .bp3-text-overflow-ellipsis',
)
await page.click(
  '.__reakit-portal > #id-6 > #id-6-1 > .bp3-menu-item > .bp3-text-overflow-ellipsis',
)

await navigationPromise

await page.waitForSelector(
  '.row:nth-child(2) > .col-6:nth-child(2) > .pub-preview-component > .preview-image-wrapper > a > .preview-image-component',
)
await page.click(
  '.row:nth-child(2) > .col-6:nth-child(2) > .pub-preview-component > .preview-image-wrapper > a > .preview-image-component',
)

await navigationPromise

await page.waitForSelector(
  '.pub-header-content-component > .draft-release-buttons-component > .large-header-button-component:nth-child(1) > .outer-label > .bottom',
)
await page.click(
  '.pub-header-content-component > .draft-release-buttons-component > .large-header-button-component:nth-child(1) > .outer-label > .bottom',
)

await navigationPromise

await page.waitForSelector('#nmghewj4i59')
await page.click('#nmghewj4i59')

await page.waitForSelector('#nmghewj4i59')
await page.click('#nmghewj4i59')

await page.waitForSelector('#nmghewj4i59')
await page.click('#nmghewj4i59')

await page.goto('https://openpresstiu.pubpub.org/pub/qhi1v8kd/draft')

await page.setViewport({ width: 1934, height: 1175 })

await page.waitForSelector('[data-node-type="citation"]')
await page.click('[data-node-type="citation"]')

await page.waitForSelector(
  '.inner > .controls-citation-component > .section > .bp3-control-group > .bp3-button',
)
await page.click(
  '.inner > .controls-citation-component > .section > .bp3-control-group > .bp3-button',
)

await page.waitForSelector(
  '.__reakit-portal > #id-20 > #id-20-2 > .bp3-menu-item > .bp3-text-overflow-ellipsis',
)
await page.click(
  '.__reakit-portal > #id-20 > #id-20-2 > .bp3-menu-item > .bp3-text-overflow-ellipsis',
)

await page.waitForSelector(
  '.controls-citation-component > .section > .bp3-control-group > .bp3-input-group > .bp3-input',
)
await page.click(
  '.controls-citation-component > .section > .bp3-control-group > .bp3-input-group > .bp3-input',
)

await page.waitForSelector(
  '.inner > .controls-citation-component > .section > .controls-button-group > .controls-button',
)
await page.click(
  '.inner > .controls-citation-component > .section > .controls-button-group > .controls-button',
)

await browser.close()

const puppeteer = require('puppeteer')
const browser = await puppeteer.launch()
const page = await browser.newPage()
const navigationPromise = page.waitForNavigation()

await page.goto('https://openpresstiu.pubpub.org/pub/qhi1v8kd/draft')

await page.setViewport({ width: 1934, height: 1175 })

await page.waitForSelector(
  '.container > .row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(1)',
)
await page.click('.container > .row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(1)')

await navigationPromise

await page.waitForSelector(
  '.pub-document-component > .pub-grid > .main-content > .pub-file-import-component > .bp3-button',
)
await page.click(
  '.pub-document-component > .pub-grid > .main-content > .pub-file-import-component > .bp3-button',
)

await page.waitForSelector(
  '.bp3-dialog-body > .bp3-button-group > .bp3-button > .bp3-button-text > .bp3-non-ideal-state',
)
await page.click(
  '.bp3-dialog-body > .bp3-button-group > .bp3-button > .bp3-button-text > .bp3-non-ideal-state',
)

await page.waitForSelector(
  '.bp3-drawer > .bp3-drawer-body > .bp3-dialog-body > .bp3-button-group > input:nth-child(2)',
)
await page.click(
  '.bp3-drawer > .bp3-drawer-body > .bp3-dialog-body > .bp3-button-group > input:nth-child(2)',
)

await page.waitForSelector(
  '.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button:nth-child(2) > .bp3-button-text',
)
await page.click(
  '.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button:nth-child(2) > .bp3-button-text',
)

await page.waitForSelector(
  '.bp3-dialog-body > .metadata-editor-component > .field-entry > .bp3-control > .bp3-control-indicator',
)
await page.click(
  '.bp3-dialog-body > .metadata-editor-component > .field-entry > .bp3-control > .bp3-control-indicator',
)

await page.waitForSelector('.proposed-attribution > .controls > .bp3-button > .bp3-icon > svg')
await page.click('.proposed-attribution > .controls > .bp3-button > .bp3-icon > svg')

await page.waitForSelector(
  '.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button:nth-child(3) > .bp3-button-text',
)
await page.click(
  '.bp3-overlay > .bp3-drawer > .bp3-drawer-footer > .bp3-button:nth-child(3) > .bp3-button-text',
)

await page.waitForSelector(
  '.text-wrapper > .byline-edit-button-component > .icon-box > .bp3-icon > svg',
)
await page.click('.text-wrapper > .byline-edit-button-component > .icon-box > .bp3-icon > svg')

await page.waitForSelector('.attribution-row > .bp3-button > .bp3-icon > svg > path')
await page.click('.attribution-row > .bp3-button > .bp3-icon > svg > path')

await page.waitForSelector(
  '.user-autocomplete-component > .bp3-popover-wrapper > .bp3-popover-target > .bp3-input-group > .bp3-input',
)
await page.click(
  '.user-autocomplete-component > .bp3-popover-wrapper > .bp3-popover-target > .bp3-input-group > .bp3-input',
)

await page.waitForSelector(
  '.bp3-popover-target > div > .bp3-input > .bp3-tag-input-values > .bp3-input-ghost',
)
await page.click(
  '.bp3-popover-target > div > .bp3-input > .bp3-tag-input-values > .bp3-input-ghost',
)

await page.waitForSelector(
  '.bottom-content > .detail-controls > .right-details > .bp3-input-group:nth-child(1) > .bp3-input',
)
await page.click(
  '.bottom-content > .detail-controls > .right-details > .bp3-input-group:nth-child(1) > .bp3-input',
)

await page.waitForSelector(
  '.bottom-content > .detail-controls > .right-details > .bp3-input-group:nth-child(2) > .bp3-input',
)
await page.click(
  '.bottom-content > .detail-controls > .right-details > .bp3-input-group:nth-child(2) > .bp3-input',
)

await page.waitForSelector(
  '.bp3-popover-target > div > .bp3-input > .bp3-tag-input-values > .bp3-input-ghost',
)
await page.click(
  '.bp3-popover-target > div > .bp3-input > .bp3-tag-input-values > .bp3-input-ghost',
)

await page.waitForSelector(
  '.bp3-popover-content > div > .bp3-menu > li:nth-child(15) > .bp3-menu-item',
)
await page.click('.bp3-popover-content > div > .bp3-menu > li:nth-child(15) > .bp3-menu-item')

await page.waitForSelector('.bp3-dialog > .bp3-dialog-header > .bp3-button > .bp3-icon > svg')
await page.click('.bp3-dialog > .bp3-dialog-header > .bp3-button > .bp3-icon > svg')

await page.waitForSelector(
  '.col-12 > .pub-header-content-component > .title-group-component > .title > .bp3-editable-text',
)
await page.click(
  '.col-12 > .pub-header-content-component > .title-group-component > .title > .bp3-editable-text',
)

await page.waitForSelector(
  '.col-12 > .pub-header-content-component > .title-group-component > .description > .bp3-editable-text',
)
await page.click(
  '.col-12 > .pub-header-content-component > .title-group-component > .description > .bp3-editable-text',
)

await page.waitForSelector(
  '.col-12 > .pub-header-content-component > .utility-buttons-component > .small-header-button-component:nth-child(3) > .pub-header-themed-box',
)
await page.click(
  '.col-12 > .pub-header-content-component > .utility-buttons-component > .small-header-button-component:nth-child(3) > .pub-header-themed-box',
)

await navigationPromise

await page.waitForSelector(
  '.input-field-component:nth-child(1) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button',
)
await page.click(
  '.input-field-component:nth-child(1) > .bp3-form-content > .bp3-popover-wrapper > .bp3-popover-target > div > .bp3-button',
)

await page.waitForSelector(
  'div > .bp3-menu > li:nth-child(4) > .bp3-menu-item > .bp3-text-overflow-ellipsis',
)
await page.click('div > .bp3-menu > li:nth-child(4) > .bp3-menu-item > .bp3-text-overflow-ellipsis')

await page.waitForSelector('div > .bp3-button > .bp3-button-text > span > .cite-example')
await page.click('div > .bp3-button > .bp3-button-text > span > .cite-example')

await page.waitForSelector(
  '.bp3-popover-content > div > .bp3-menu > li:nth-child(2) > .bp3-menu-item',
)
await page.click('.bp3-popover-content > div > .bp3-menu > li:nth-child(2) > .bp3-menu-item')

await page.waitForSelector(
  '.pub-settings-container_doi-component > .bp3-form-group > .bp3-form-content > .bp3-input-group > .bp3-input',
)
await page.click(
  '.pub-settings-container_doi-component > .bp3-form-group > .bp3-form-content > .bp3-input-group > .bp3-input',
)

await page.waitForSelector(
  '.buttons > .file-upload-button-component > .bp3-button > .bp3-button-text > .file-select',
)
await page.click(
  '.buttons > .file-upload-button-component > .bp3-button > .bp3-button-text > .file-select',
)

await page.waitForSelector(
  '.breadcrumbs-component > .breadcrumbs-content > .breadcrumb-actions > .bp3-button > .bp3-button-text',
)
await page.click(
  '.breadcrumbs-component > .breadcrumbs-content > .breadcrumb-actions > .bp3-button > .bp3-button-text',
)

await navigationPromise

await page.waitForSelector('[data-node-type="citation"]')
await page.click('[data-node-type="citation"]')

await page.waitForSelector(
  '.pub-draft-header-component > .formatting-bar-component > .formatting-bar-controls-container-component > .close-button-container > .bp3-button',
)
await page.click(
  '.pub-draft-header-component > .formatting-bar-component > .formatting-bar-controls-container-component > .close-button-container > .bp3-button',
)

await browser.close()
