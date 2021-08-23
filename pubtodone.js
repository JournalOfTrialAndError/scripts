#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises
const nodePandoc = require('node-pandoc-promise')
const { joteBoilerplate } = require('./jote-new-boilerplate')
const https = require('https')
const FormData = require('form-data')
const { program } = require('commander')
const util = require('util')
const { execSync, exec } = require('child_process')
const cheerio = require('cheerio')
const htmlparser2 = require('htmlparser2')
const JSZip = require('jszip')
const Cite = require('citation-js')
const { latexSymbols } = require('./latex')
const inquirer = require('inquirer')

const regexes = {
  misc: {
    find: [/\\textbf\{\\hfill\\break\n\}/gm, /\~([A-Z])/gm, /\.\~/gm],
    replace: ['', ' $1', '. '],
  },
  lines: {
    find: [/(?<!([\.\?\!\}\%\)]\n)|([\.\%]))\n/gm, / +/gm],
    replace: ['$1 ', ' '],
  },
  citations: {
    find: [
      /([A-Z]\w+,? )and( [A-Z][\w\u00E9\']+,?) (\(?\d{4}\)?)/gm,
      /(?<=(\d ?)); ([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\13)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?, (\d{4}),? ?(p+\. ?\d+ *)?(\))?/gm,
      /\(([\w ]*)(?=; ?)?(; ?)?([a-z, ]*)? ?([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\14)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?, (\d{4}),? ?(p+\. ?\d+ *)?(,\w+\d{4})*\)/gm,
      /([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\12)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?(\'s)? \((\d{4})\)/gm,
    ],
    replace: [
      '$1\\&$2 $3',
      ',$3$19$21',
      // TODO replace nptextcite parencite or a more manual approach, pubpub does not pick up nptextcite
      '($1$2\\nptextcite[$22]{$5$21$23})',
      '\\textcite{$2$19}$18',
    ],
  },
  sections: {
    find: [
      /(?<=(\n|))\\textbf\{([^\}]*)\} ?\n/gm,
      /\\hypertarget\{\w+\}\{\%\n\\(\w+)\\[(\w+)]\{\\texorpdfstring\{\2(\\protect\\hypertarget\{[^\}]*\}\{\}\{\d\})\}\{\2\d\}\}[^\n]\n/gm,
      // /\\hypertarget\{[^\}]*\}\{\%\n\\([^\{]*)\{([^\{]*)\}[^\n]*\n/gm],
      /(\\textbf\{References\}|\\addcontentsline\{toc\}\{section\}\{References\}\n\\section\{References\})(.+?(?=(\\addcontentsline|\\end\{document\})))/gms,
      /\\hypertarget\{[^\}]*\}\{\%\n\\([^\{]*)\{(\\texorpdfstring\{)?([^\}]*)\}[^\n]*\n/gm,
    ],
    replace: [
      '\n\\addcontentsline{toc}{section}{$2}\n\\section{$2}\n\n',
      '\n\\addcontentsline{toc}{$1}{$2}\n\\$1{$2$3}\n\n',
      '\\printbibliography\n\n',
      '\n\\addcontentsline{toc}{$1}{$3}\n\\$1{$3}\n\n',
    ],
  },
  // tables: {
  //   find: [/\\begin\{longtable\}.+?\\end\{longtable\}/gms,

  //   ],
  //   replace: ["",

  //   ]
  // }
  unicode: {
    find: [...Object.keys(latexSymbols)],
    replace: [...Object.values(latexSymbols)],
  },
}

const complexRegexes = {
  footnotes: {
    match: [/(?<=(\\protect\\hypertarget\{fn-(\d)-bottom\}\{\}\{\{\{\}\{\}\}\} \n))(.*)\n/gm],
    find: [/\\protect\\hypertarget\{\w+\}\{\}\{(\d+)\}/gm],
    replace: ['\\footnote{${match[index][3]}}'],
    number: [0, 1],
  },
  metadata: {
    match: [
      /\\addcontentsline\{toc\}\{section\}\{Abstract\}\n\\section\{Abstract\}\n\n(.*)/gm,
      /\\addcontentsline\{toc\}\{section\}\{(.+?(?=\}))\}\n\\section\{.*?\}/gs,
      /\\addcontentsline\{toc\}\{section\}\{Keywords ?\}\n\\section\{Keywords\}[^\w]+([^\\]+)/gms,
    ],
    // this is the group you want to replace
    replace: [1, 1, 1],
    // this is the target string to replace
    find: [/abstractmarker/gm, /titlemarker/gm, /keywordsmarker/gm],
    // specify the amount of matches you want. 0 is all, 1 is 1, etc.
    number: [0, 1, 1],
  },
}

const finalRegexes = (miscargs) => ({
  miscer: {
    find: [
      /receivedmarker/gm,
      /acceptedmarker/gm,
      /publishedmarker/gm,
      /publisheddatemarker/gm,
      /bibmarker/gm,
      /doimarker/gm,
      /runningmarker/gm,
      /typemarker/gm,
      /citationstylemarker/gm,
    ],
    replace: miscargs,
  },
})

const promoteSection = (convData) => {
  let temp
  temp = convData.replaceAll(/\\section/gm, '\\chapter')
  temp = temp.replaceAll(/\{section\}/gm, 'chapter')
  temp = temp.replaceAll(/subsection/gm, 'section')
  temp = temp.replaceAll(/\\paragraph\{/gm, '\\subsection{')
  temp = temp.replaceAll(/\{paragraph\}/gm, '{subsection}')
  temp = temp.replaceAll(/\{subparagraph\}/gm, '{paragraph}')
  return temp
}

const convert = async ({
  input,
  promote,
  received,
  accepted,
  published,
  crossmark,
  type = 'empirical',
  citation = 'authordate',
  doi,
  running,
  engine = 'xelatex',
  pdf,
  compile,
  bibliography,
}) => {
  const file = `${input.slice(0, -5)}`
  const dirpath = path.dirname(fs.realpathSync(input))
  const args = ['-f', 'docx', '-t', 'latex', '-o', `${dirpath}/temp.tex`, '--extract-media=media']
  const miscargs = [
    received,
    accepted,
    published,
    crossmark,
    `${file}.bib`,
    doi,
    running,
    type,
    citation,
  ].map((m) => m ?? 'TOBEFILLEDIN')

  try {
    await nodePandoc(input, args)
  } catch (e) {
    if (e.status === 127) {
      console.error(
        'You do not have Pandoc installed. Please install it in order to use this converter.',
      )
      return
    }

    console.error('Something went wrong.')
    console.error(e)
    return
  }

  let convData = fs.readFileSync(`${dirpath}/temp.tex`, { encoding: 'utf8' })

  //Easy regex, just simple find replace
  Object.values(regexes).forEach((section) => {
    section['find'].forEach((regex, index) => {
      convData = convData.replaceAll(regex, section['replace'][index])
    })
  })
  convData =
    joteBoilerplate +
    convData +
    `
\\end{document}`

  // complex regex: find something, then put it somewhere else
  Object.values(complexRegexes).forEach((section) => {
    section['match'].forEach((regex, index) => {
      const match = section['number'][index]
        ? Array.from(convData.matchAll(regex)).slice(0, section['number'][index])
        : Array.from(convData.matchAll(regex))
      if (match.length) {
        match.forEach((m) => {
          const importantThingy = m[section['replace'][index]]
          const wholeGuy = m[0]
          convData = convData.replace(section['find'][index], importantThingy)
          convData = convData.replaceAll(wholeGuy, '')
        })
      }
    })
  })

  const regs = finalRegexes(miscargs)
  Object.values(regs).forEach((section) => {
    section['find'].forEach((regex, index) => {
      convData = convData.replace(regex, section['replace'][index])
    })
  })

  if (promote) {
    convData = promoteSection(convData)
  }
  fs.writeFileSync(input.substring(0, input.length - 4) + 'tex', convData)
  fs.unlinkSync('temp.tex', (err) => {
    console.error(err)
  })

  if (!compile) {
    console.log('Donzo')
    return
  }
  // console.log('Generating bibliography from pdf')

  // const formData = new FormData()
  // formData.append('input', fs.createReadStream(`${dirpath}/${file}`))
  // formData.append('consolidateCitations', '1')

  // const options = {
  //   method: 'POST',
  //   host: 'cloud.science-miner.com',
  //   path: '/grobid/api/processReferences',
  //   protocol: 'https:',
  //   headers: {
  //     Accept: 'application/x-bibtex',
  //     //      "Request type": "multipart/form-data",
  //   },
  // }

  // const req = https.request(
  //   formData.submit(options, (err, res) => {
  //     console.log(`STATUS: ${res.statusCode}`)
  //     console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
  //     res.setEncoding('utf8')
  //     let rawData = ''
  //     res.on('data', (chunk) => {
  //       rawData += chunk
  //     })
  //     res.on('end', () => {
  //       const chunks = [...rawData.matchAll(/\@.+?\n\}\n?/gms)].flat()
  //       const num = /\@(\w+)\{(\d+)/g
  //       const dt = /date = \{(\d\d\d\d)[^\}]*\}/g
  //       const auth = /author = \{(\w+)/g
  //       const newChunks = chunks.map((ch, index) => {
  //         const date = [...ch.matchAll(dt)][0]
  //         const author = [...ch.matchAll(auth)][0]
  //         if (!date?.length || !author?.length) {
  //           return
  //         }
  //         const chun = ch.replace(num, `\@$1\{${author[1]}${date[1]}`)
  //         return chun.replace(dt, `date = \{${date[1]}\}`)
  //       })
  //       const bibloc = `${dirpath}/${input.slice(0, -5)}.bib`
  //       fs.unlinkSync(bibloc)
  //       fs.writeFileSync(`${dirpath}/${input.slice(0, -5)}.bib`, newChunks.join('\n'))
  console.log('Extracted citations.')

  await execSync(
    `rm -f *.aux *.bbl *.bcf *.log *.blg *.fdb_latexmk *.fls *.out *.upa *.xdv *.upb *.vdv`,
  )
  try {
    console.log('Converting to pdf...')
    await execSync(
      `latexmk -pdf -pdflatex=${engine} -jobname=${file}-conv -interaction=nonstopmode -file-line-error -f   ${file}.tex`,
    )
  } catch (e) {
    if (e.status === 127) {
      console.log(
        "Whoops, you don't seem to have LaTeXMk installed. \n Want to try to do it with normal latex?",
      )
      const answer = await inquirer.prompt([{ type: 'input', name: 'answer', message: 'y/n' }])
      if (answer.answer === n) {
        console.log('Exiting conversion. Please install LaTeXMk.')
      }
      try {
        console.log('Just running xelatex and bibtex a bunch')
        await exec(`xelatex interaction=nonstopmode -f ${file.pdf}`)
        await exec(`biber ${file}`)
        await exec(`xelatex interaction=nonstopmode -f ${file.pdf}`)
        await exec(`biber ${file}`)
        await exec(`xelatex interaction=nonstopmode -f ${file.pdf}`)
      } catch (e) {
        console.log('Ah fuck.')
        console.error(e)
        return
      }
    }
    console.error(e)
    console.log(`Something went wrong while generating the pdf, probably because you either
don't have the correct files in the correct folder, don't have latexmk, xelatex or biber
installed/on your path, or you don't have the correct fonts.`)
    console.log(`You can always manually copy the .tex and .bib into overleaf.`)
    return
  }
  console.log("We're done!")
  console.log(`Opening ${file}.pdf`)
  try {
    await execSync(`open ${file}-conv.pdf`)
  } catch (e) {
    console.log("Couldn't open the dang thing.")
    console.error(e)
    return
  }
  //   })
  //   if (err) {
  //     console.error(err)
  //     return
  //   }
  //   return
  // }),
  // )
}

const promote = ({ input }) => {
  fs.promises
    .readFile(input, { encoding: 'utf8' }, (err, data) => {})
    .then((res) => {
      let convData = res
      promoteSection(convData)
    })
    .then((res) => {
      console.log(res)
      fs.writeFile(input.substring(0, input.length - 4) + 'tex', res, (err) =>
        console.log('Promoted headings'),
      )
    })
}

const docxjs = ({ input }) => {
  docx4js.default.load(input).then((docx) => {
    let doc = ''
    docx.render((type, props, children) => {
      if (type === 'tbl') {
        //console.log({ type, props, children })
        // console.log(props)
        //widths
        //props.cols.forEach((col) => console.log(col.attribs['w:w']))
        console.log(props.pr.children)
      }
      return
    })
  })
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
  const docx = fs.readFileSync(input)
  const zip = await JSZip.loadAsync(docx)
  const xml = await zip.file('word/document.xml').async('string')

  const $ = cheerio.load(xml)
  if (tables) {
    //find the bables
    const voila = $('w\\:tbl')
      .map((t, table) => {
        let cols = ''
        // find the rows
        const tab = $(table)
          .find('w\\:tr')
          .map((r, row) => {
            cols = 0
            // find the columns
            return $(row)
              .find('w\\:tc')
              .map((c, column) => {
                cols++
                //find the text, wihch is found in <w:r>
                return $(column)
                  .find('w\\:p')
                  .map((r, row) => {
                    const text = $('w\\:t', row).text()
                    const italics = !!$(row).find('w\\:i').length ? `\\textit{${text}}` : text
                    console.log(italics)
                    const bold = !!$(row).find('w\\:b').length ? `\\textbf{${italics}}` : italics
                    console.log(bold)
                    console.log(`Table ${t}. Row ${r}. Column ${c}: ${text}`)
                    return bold
                  })
                  .toArray()
                  .join(' ')
              })
              .toArray()
              .join(' & ')
          })
          .toArray()
          .join('\\ \n')
        const aligns = Array(cols).join(' l ')
        return `\\begin{tabularx}{\\columnwidth}[${aligns}]
      ${tab}
\\end{tabularx}`
      })
      .toArray()
    console.log(voila)
  }
  if (cite) {
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
  if (ref) {
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
}

program
  .command('convert')
  .description('just do what I want')
  .option('-i, --input <input>', 'The input file in .docx')
  .option('-r, --received <input>', 'The date the paper was received, D Month, YYYYY')
  .option('-a, --accepted <input>', 'The date the paper was accepted, D Month, YYYYY')
  .option('-p, --published <input>', 'The date the paper was published, D Month, YYYYY')
  .option('-c, --crossmark <input>', 'The date for crossmark, YYYYY-MM-DD')
  .option('-t, --type <input>', 'The type of the paper.')
  .option('-d, --doi <input>', 'The doi of the paper, just the suffix.')
  .option('--running <input>', 'The running head')
  .option('--citation <input>', 'The citation style. Either authordate or numeric')
  .option('-p, --pdf <input>', 'A pdf version of the docfile to generate citations.')
  .option('--compile', 'Whether to compile the pdf')
  .option('-b, --bibliography', 'Whether to do bib stuff')
  .option('--promote', 'Whether to promote all headlines by 1')
  .option(
    '--engine <input>',
    'Which LaTeX engine to use. Defaults to XeLaTeX. Options: pdf xelatex lualatex',
  )
  .action(convert)

program
  .command('promote')
  .description('promote all sections with one')
  .option('-i, --input <input>', 'The input file in .tex')
  .action(promote)

program.command('docxjs').option('-i, --input <input>', 'The input file in .docx').action(docxjs)
program
  .command('cheerio')
  .option('-i, --input <input>', 'The input file in .docx')
  .option('--tables', 'Convert the tables to LaTeX')
  .option('--ref', 'Get a plaintext list of the references, sort of.')
  .option('--cite', 'Steal the references from this hardworking researcher.')
  .option(
    '-f, --format <input>',
    'The citation bib format. Defaults to bibtex. Options are those of CitationJS',
  )
  .action(cheer)
program.parse()
