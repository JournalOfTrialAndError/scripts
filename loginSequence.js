const loginSequence = async (baseurl, email, password, page, navprom) => {
  await page.goto(baseurl)

  await page.setViewport({ width: 1800, height: 800 })

  await navprom

  await page.waitForSelector(
    '.row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(3) > .bp3-button-text',
  )
  await page.click(
    '.row > .col-12 > .buttons-wrapper > .bp3-button:nth-child(3) > .bp3-button-text',
  )

  await navprom

  await page.waitForSelector('#input-Email')
  await page.click('#input-Email')

  await page.type('#input-Email', email)

  await page.waitForSelector('#input-Password')

  await page.click('#input-Password')
  await page.type('#input-Password', password)

  await page.waitForSelector(
    'form > .input-field-component > .bp3-form-content > .bp3-button > .bp3-button-text',
  )
  await page.click(
    'form > .input-field-component > .bp3-form-content > .bp3-button > .bp3-button-text',
  )
  await navprom
}
module.exports = loginSequence
