const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises
const cheerio = require('cheerio')
const htmlparser2 = require('htmlparser2')
const JSZip = require('jszip')
const Cite = require('citation-js')

const convertTables = async ($) => {
  //find the bables
  const voila = $('w\\:tbl')
    .map((t, table) => {
      const cols = $(table).find('w\\:gridCol')
      const widths = cols.map((i, col) => $(col).attr('w:w')).toArray()
      const totalW = widths.reduce((acc, w) => (acc += parseInt(w)), 0)
      const aligns = widths
        .map((w) => `S[table-column-width=${(w / totalW).toFixed(3)}\\linewidth]`)
        .join(' ')
      // find the rows
      const tab = $(table)
        .find('w\\:tr')
        .map((r, row) => {
          // find the columns
          const rr = $(row)
            .find('w\\:tc')
            .map((c, column) => {
              //find the text, wihch is found in <w:r>
              return $(column)
                .find('w\\:p')
                .map((r, row) => {
                  const text = $('w\\:t', row).text()
                  const escapedText = text.match(/[a-zA-Z]/g) ? `{${text}}` : text
                  const italics = !!$(row).find('w\\:i').length
                    ? `\\textit{${escapedText}}`
                    : escapedText
                  const bold = !!$(row).find('w\\:b').length ? `\\textbf{${italics}}` : italics
                  return bold
                })
                .toArray()
                .join(' ')
            })
            .toArray()
            .join(' & ')
          return r === 0 ? `${rr}\\\\\n\\toprule` : `${rr}\\\\\n\\hline`
        })
        .toArray()
        .join('\n')
      return `\n
\\begin{table}[h!]
  \\begin{fullwidth}
  \\caption{}
  \\label{tab:table${t + 1}}
    \\begin{tabularx}{\\linewidth}{${aligns}}
      ${tab}
    \\end{tabularx}
  \\end{fullwidth}
\\end{table}\n
`
    })
    .toArray()
  return voila
}

const extractCites = async ($, format) => {
  const cites = $('w\\:instrText')
    .map((i, cite) => {
      const citation = JSON.parse(
        $(cite)
          .text()
          .trim()
          .match(/\{.+\}/),
      )
      return citation?.citationItems && citation?.citationItems
    })
    .toArray()
    .flat()

  if (cites.length === 0) {
    console.log(`No citations found. This might be because there were no citations,\n
or because they were made using shitty software.\n
Trying to extract cites manually.`)
    return
  }

  const uniqueCites = cites
    .filter((cite, i) => {
      return !cites.some((c, j) => {
        if ((i = j)) {
          return false
        }
        return c.id === cite.id
      })
    })
    .map((u) => u.itemData)

  console.log(`Succesfully extracted ${cites.length} unique citations.
Converting...
`)
  const citeString = JSON.stringify(uniqueCites, null, 2)

  const render = Cite(citeString)
  const voila = render.format(format)

  fs.writeFileSync(`${input.slice(0, -5)}.bib`, voila)
  console.log(`Output ${format} file to ${input.slice(0, -5)}.bib`)
}

const convertReferences = async ($) => {
  const paragraphs = $('w\\:p')

  let refToggle = false
  console.log('Extracting references manually')
  const citeString = paragraphs
    .map((i, par) => {
      const p = $(par)
        .find('w\\:t')
        .filter((i, t) => {
          const txt = $(t).text()
          if (refToggle && txt.includes('Appendix')) {
            refToggle = false
            return false
          }
          if (txt === 'References') {
            refToggle = true
            //I don't want the word "references"
            return false
          }
          return refToggle
        })
        .map((i, t) => {
          return $(t).text()
        })
        .toArray()
        .join('')
      if (!p.length) {
        return
      }
      return p
    })
    .toArray()
    .join('\n')

  const name = input.slice(0, -5)
  fs.writeFileSync(`${name}.txt`, citeString)
  console.log('Parsing extracted citations...')
  try {
    const bib = await execSync(`anystyle -f bib parse ${name}.txt `)
    const bibber = fs.readFileSync(bib)
    const bibbest = bibber.replaceAll(/\@(\w+)\{(.+?)a,/g, '@$1{$2,')
    console.log(bibbest)
    fs.writeFileSync(`${file}.bib`, bibbest)
  } catch (e) {
    console.error(e)
    if (e.status == 127) {
      console.log(
        'You do not have AnyStyle installed. Want to try to install it? (if you have Ruby)',
      )
      const answer = await inquirer.prompt([{ type: 'input', name: 'answer', message: 'y/n' }])
      if (answer.answer === 'n') {
        console.log('Exiting bibliography parsing.')
        return
      }
      try {
        await exec('gem install anystyle xrel')
      } catch (e) {
        if (e.status === 127) {
          console.error('Ruby not installed.')
          console.log(
            'First install Ruby in order to do this conversion.\n https://www.ruby-lang.org/en/downloads/',
          )
          return
        }
        console.error('Something went wrong, no idea what though.')
        console.log(e)
        return
      }
      console.log('Anystyle successfully installed!')
      try {
        console.log('Trying conversion again...')
        await exec(`anystyle parse ${name}.txt`)
      } catch (e) {
        if (e.status === 127) {
          console.log(
            "For some reason installation still did not work. \n You probably don't have anystyle on your path, see the error below.",
          )
          console.error(e)
          return
        }
        console.error('Something else went wrong, sucks.')
      }
    }
    console.error('Apparently you do have Anystyle installed, but something still went wrong.')
    console.log(e)
    return
  }

  // const voila = render.format(format)
  console.log(`Stored extracted bibliography to ${name}.bib`)
  // console.log(`Output ${format} file to ${input.slice(0, -5)}-ref.bib`)
}

const getDocxXml = async (input) => {
  const docx = fs.readFileSync(input)
  const zip = await JSZip.loadAsync(docx)
  const xml = await zip.file('word/document.xml').async('string')

  return cheerio.load(xml)
}

const cheer = async (props) => {
  const { input, tables, ref, cite, format = 'bibtex' } = props
  // const zip = fs.createReadStream(input).pipe(unzipper.Parse({ forceStream: true }))
  // for await (const entry of zip) {
  //   const fileName = entry.path
  //   const type = entry.type // 'Directory' or 'File'
  //   const size = entry.vars.uncompressedSize // There is also compressedSize;
  //   if (fileName === 'word/document.xml') {
  //     //const dom = htmlparser2.parseDocument(entry)
  //     console.log(entry.buffer)
  const $ = getDocxXml(input)

  if (tables) {
    return convertTables($)
  }
  if (cite) {
    return extractCites($, format)
  }
  if (ref) {
    return convertReferences($)
  }
}

module.exports = {
  getDocxXml: getDocxXml,
  convertTables: convertTables,
  extractCites: extractCites,
  convertReferences: convertReferences,
}
