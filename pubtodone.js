#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises
const nodePandoc = require('node-pandoc-promise')
const { oldJoteBoilerplate } = require('./jote-boilerplate')
const { joteBoilerplate } = require('./jote-new-boilerplate')
const https = require('https')
const FormData = require('form-data')
const { program } = require('commander')
const util = require('util')
const { execSync, exec } = require('child_process')
const htmlparser2 = require('htmlparser2')
const inquirer = require('inquirer')
const { cite, tables, cheer } = require('./cheer')
const { regexes, complexRegexes, finalRegexes, pubpub } = require('./regexes')

const promoteSection = (convData) => {
  let temp = convData
  //temp = convData.replaceAll(/\\section/gm, '\\chapter')
  //temp = temp.replaceAll(/\{section\}/gm, 'chapter')
  temp = temp.replaceAll(/subsection/gm, 'section')
  temp = temp.replaceAll(/\\paragraph\{/gm, '\\subsection{')
  temp = temp.replaceAll(/\{paragraph\}/gm, '{subsection}')
  temp = temp.replaceAll(/\{subparagraph\}/gm, '{paragraph}')
  return temp
}

const convert = async (props) => {
  const {
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
    old,
    pub,
  } = props
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

  //pandoc add neither begin or end document
  convData = `${convData}\n
\\end{document}`
  const boilerplate = old ? oldJoteBoilerplate : joteBoilerplate
  //Easy regex, just simple find replace
  Object.values(regexes).forEach((section) => {
    section['find'].forEach((regex, index) => {
      convData = convData.replaceAll(regex, section['replace'][index])
    })
  })
  convData = boilerplate + convData

  const tabs = await tables(input)
  // tables
  Array.from(convData.matchAll(/\\begin\{longtable\}.+?\\end\{longtable\}/gms)).forEach(
    (tab, i) => (convData = convData.replace(tab, tabs[i])),
  )

  if (promote) {
    convData = promoteSection(convData)
  }
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

  if (old) {
    convData = convData.replaceAll(/section\{/gm, 'section*{')
  }

  if (pub) {
    pubpub.find.forEach((regex, i) => {
      convData = convData.replaceAll(regex, pubpub.replace[i])
    })
  }

  const regs = finalRegexes(miscargs)
  Object.values(regs).forEach((section) => {
    section['find'].forEach((regex, index) => {
      convData = convData.replace(regex, section['replace'][index])
    })
  })
  // Make the sections Sentence case instead of Title Case
  // Did not really know where else to put
  convData = convData.replaceAll(/section(\*)?(\})?\{(.+?)\}/gm, (string, star, paren, title) => {
    const st = !!star ? '*' : ''
    const pr = !!paren ? '}' : ''
    return `section${st}${pr}{${title.slice(0, 1)}${title.slice(1).toLowerCase()}}`
  })

  fs.writeFileSync(input.substring(0, input.length - 4) + 'tex', convData)
  fs.unlinkSync('temp.tex', (err) => {
    console.error(err)
  })

  await cite(input, true, false) // console.log('Generating bibliography from pdf')

  console.log('this should be after')
  if (!compile || pub) {
    console.log('Donzo')
    return
  }
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
    if (e.code === 127) {
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

    console.log(`Trying to open ${file}.pdf anyway`)
    try {
      exec(`xdg-open ${file}-conv.pdf`)
    } catch (e) {
      console.log("Couldn't open the dang thing.")
      console.error(e)
      return
    }
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
  .option('--old', 'Use the old template')
  .option('--pub', 'Generate the pubpub tex file (different citations, different tables.)')
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
