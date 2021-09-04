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
//const { latexSymbols } = require('./latex')
const inquirer = require('inquirer')
const addFullCite = require('./addfullcite')
const bookBoilerplate = require('./basic-boilerplate')
const { getDocxXml, convertTables, extractCites, convertReferences } = require('./cheerio')
const { sentenceCase, titleCase, lowerCase } = require('change-case-all')

const simpleRegexes = (text, pubpub, spanish) => {
  let data = text
  const regexes = {
    misc: {
      find: [/\\textbf\{\\hfill\\break\n\}/gm, /\~([A-Z])/gm, /\.\~/gm, /\\sout\{(.*?)\}/gm],
      replace: ['', ' $1', '. ', '$1'],
    },
    lines: {
      find: [/(?<!([\.\?\!\}\%\)]\n)|([\.\%]))\n/gm, / +/gm],
      replace: ['$1 ', ' '],
    },
    citations: {
      find: [
        /([A-Z]\w+,? )and( [A-Z][\w\u00E9\']+,?) (\(?\d{4}\)?)/gm,
        /(?<=(\d ?))(;|,) ([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\13)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?,? (\d{4}|\d+ [A-Z\.]+),? ?(p+\. ?\d+ *)?(\))?/gm,
        //        /\(([\w ]*)(?=; ?)?(; ?)?([a-z, ]*)? ?(([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\14)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?),? (\d{4}|\d+ ?[A-Z\.]+)[,\:]? ?([^\;\,\)]*)(\;|\))/gm,
        /\(([\w ]*)(?=; ?)?(; ?)?([a-z, ]*)? ?(([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\14)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?),? (\d{4}|\d+ ?[A-Z\.]+)(\/\d{4})?( ?\{\[\}.+?\{\]\})?([,\:] ([^\;\,\)]*))?(\;|\))/gms,
        /([A-Z]\. ?)*((([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\12)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?)(\'s)? \(((\d{4})|(\d+) ([A-Z\.]+))(\/\d{4})?( ?\{\[\}.+?\{\]\})?([,\:] ([^\;\,\)]*))?\)/gms,
        /\, (\)|;)/gm,
        /\\citeyear\{(.+?)(\d{4})\}(;|,) (\d{4})/gm,
      ],
      replace: [
        '$1\\&$2 $3',
        (
          match,
          one,
          two,
          three,
          four,
          five,
          six,
          seven,
          eight,
          nine,
          ten,
          eleven,
          twelve,
          thirteen,
          fourteen,
          fifteen,
          sixteen,
          seventeen,
          eighteen,
          nineteen,
          twenty,
          twentyone,
          twentytwo,
          twentythree,
          twentyfour,
        ) => {
          //const fullname = four
          //const name = five && !spanish ? five.replaceAll(/ /g, '') : three.replaceAll(/ /g, '')
          //const prefix = five && !spanish ? `${four} ` : ''
          //const year = twentyone
          const prefix = one ? `${one}${two}` : ''
          const suffix = twentythree ? `, ${twentythree}` : ''
          const paren = twentytwo ? twentytwo : ''
          if (pubpub) {
            return `; \\parencite{${four}${twenty}}${paren}`
          }
          return `; \\pdftooltip{{\\color{tip}${four}}}{\\fullcite{${four}${twenty}}}, \\citeyear{${four}${twenty}}${paren}`
        },
        // PAREN
        (
          match,
          one,
          two,
          three,
          four,
          five,
          six,
          seven,
          eight,
          nine,
          ten,
          eleven,
          twelve,
          thirteen,
          fourteen,
          fifteen,
          sixteen,
          seventeen,
          eighteen,
          nineteen,
          twenty,
          twentyone,
          twentytwo,
          twentythree,
          twentyfour,
          twentyfive,
          twentysix,
          twentyseven,
        ) => {
          //const fullname = four
          //const name = five && !spanish ? five.replaceAll(/ /g, '') : three.replaceAll(/ /g, '')
          //const prefix = five && !spanish ? `${four} ` : ''
          //const year = twentyone
          const prefix = one ? `${one}${two}` : ''
          const suffix = twentysix ? `, ${twentysix}` : ''
          const paren = twentyseven ? twentyseven : ''
          const altdirtydate = twentyfour || twentythree
          const altdate = altdirtydate ? altdirtydate.replaceAll(/[^\d]/g, '') : ''
          const correctdate = twentytwo.includes('C')
            ? altdate || twentytwo
            : altdate
            ? Math.max(altdate, twentytwo)
            : twentytwo

          if (pubpub) {
            return `(${prefix}\\parencite{${six}${correctdate}}${suffix}${paren}`
          }
          return `(${prefix}\\pdftooltip{{\\color{tip}${four}}}{\\fullcite{${six}${correctdate}}}, \\citeyear{${six}${correctdate}}${suffix}${paren}`
        },
        (
          match,
          one,
          two,
          three,
          four,
          five,
          six,
          seven,
          eight,
          nine,
          ten,
          eleven,
          twelve,
          thirteen,
          fourteen,
          fifteen,
          sixteen,
          seventeen,
          eighteen,
          nineteen,
          twenty,
          twentyone,
          twentytwo,
          twentythree,
          twentyfour,
          twentyfive,
          twentysix,
          twentyseven,
        ) => {
          const fullname = two
          const name = five && !spanish ? five.replaceAll(/ /g, '') : three.replaceAll(/ /g, '')
          const prefix = five && !spanish ? `${four} ` : ''
          const year = twentyone || ''
          const suffix = twentyseven ? `, ${twentyseven}` : ''
          const altdirtydate = twentythree || twentyfive
          const altdate = altdirtydate ? altdirtydate.replaceAll(/[^\d]/g, '') : ''
          const correctdate = year.includes('C')
            ? altdate || year
            : altdate
            ? Math.max(altdate, year)
            : year
          if (pubpub) {
            return `${prefix}\\textcite{${name}${correctdate}}${suffix}`
          }
          return `\\pdftooltip{{\\color{tip}${fullname}}}{\\fullcite{${name}${correctdate}}} (\\citeyear{${name}${year}}${suffix})`
        },
        '$1',
        '\\citeyear{$1$2};\\pdftooltip{  }{\\fullcite{$1$4}}\\citeyear{$1$4}',
      ],
    },
    sections: {
      find: [
        /(?<=(\n|))\\textbf\{([^\}]*)\} ?\n/gm,
        /\\hypertarget\{\w+\}\{\%\n\\(\w+)\\[(\w+)]\{\\texorpdfstring\{\2(\\protect\\hypertarget\{[^\}]*\}\{\}\{\d\})\}\{\2\d\}\}[^\n]\n/gm,
        // /\\hypertarget\{[^\}]*\}\{\%\n\\([^\{]*)\{([^\{]*)\}[^\n]*\n/gm],
        /(\\textbf\{(References|Bibliography)\}|\\section\{(References|Bibliography)\})(.+?(?=(\\textbf|\\addcontentsline|\\end\{document\})))/gms,
        /\\hypertarget\{[^\}]*\}\{\%\n\\([^\{]*)\{(\\texorpdfstring\{)?([^\}]*)\}[^\n]*\n/gm,
      ],
      replace: [
        (match, one, two) => {
          const noNum = two.replaceAll(/\d+\. /gm, '')
          const sentenced = sentenceCase(noNum)
          return `\n\\addcontentsline{toc}{section}{${sentenced}}\n\\section{${sentenced}}\n\n`
        },
        (match, one, two) => {
          const noNum = two.replaceAll(/\d+\. /gm, '')
          const sentenced = sentenceCase(noNum)
          return `\n\\addcontentsline{toc}{${one}}{${sentenced}}\n\\${two}{${sentenced}}\n\n`
        },
        '\\nocite{*}\n\\printbibliography\n\n',
        (match, one, two, three) => {
          const noNum = three.replaceAll(/\d+\. /gm, '')
          const sentenced = sentenceCase(noNum)
          return `\n\\addcontentsline{toc}{${one}}{${sentenced}}\n\\${one}{${sentenced}}\n\n`
        },
      ],
    },
    // tables: {
    //   find: [/\\begin\{longtable\}.+?\\end\{longtable\}/gms,

    //   ],
    //   replace: ["",

    //   ]
    // }
    //  unicode: {
    //    find: [...Object.keys(latexSymbols)],
    //    replace: [...Object.values(latexSymbols)],
    //  },
  }

  Object.values(regexes).forEach((section) => {
    section['find'].forEach((regex, index) => {
      data = data.replaceAll(regex, section['replace'][index])
    })
  })

  //addd labels
  if (pubpub) {
    return data
  }
  console.log(data)
  data = data.replaceAll(/\\label\{.+?\}/gms, '')
  sections = [...data.matchAll(/\\section\{(.+?)\}/gm)]
  sections.forEach(
    (sec, index) =>
      (data = data.replace(
        sections[index][0],
        `\\section{${sections[index][1]}\n\\label{sec:${index + 1}}}\n`,
      )),
  )
  data = data.replaceAll(/(S?s?ection|§) (\d+)/gm, (string, section, s, num) => {
    if (!sections.length || !section || !num || !sections[num]) {
      return
    }
    return `\\pdftooltip{{\color{tip}${section} }}{${num}. ${
      sections[num - 1][1]
    }}\\ref{sec:${num}}`
  })
  return data
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

const replaceFootnotes = (text) => {
  let data = text

  const endNotes = [
    ...data.matchAll(
      /\\protect\\hypertarget\{.+?bottom\}\{\}\{\{\{\}\{\}\}\}\n\n(.*?)\\protect\\hyperlink\{.+?\}\{.+?\}\n/gms,
    ),
  ]
  // endNotes.forEach((end) => {
  //   data = data.replaceAll(end[0], '')
  // })
  data = data.replaceAll(/\\hypertarget\{footnotes\}(.+?)\\end\{document\}/gms, '')
  const cleanedEndNotes = endNotes.map((n) => n[1].replaceAll(/\n/gm, ' ').trim())
  const footNotes = [...data.matchAll(/\\protect\\hypertarget\{\w+\}\{\}\{(\d+)\}/gms)]
  footNotes.forEach((fn, index) => {
    data = data.replace(fn[0], `\\footnote{${cleanedEndNotes[index]}}`)
  })
  return data
}

const finalRegexes = (miscargs, file) => ({
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
      /chaptermarker/gm,
    ],
    replace: [...miscargs, () => `${parseInt(file) - 1}`],
  },
  sections: {
    find: [
      /\\addcontentsline.+?\n/gm, ///section\{\d+[^\w]*([^\}]*)\}/gm
    ],
    replace: [
      '', //'section{\\MakeSentenceCase{$1}}'
    ],
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

const docxConversion = async (input, args) => {
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

  return await getDocxXml(input)
}

const pubpubClean = (input) => {
  let text = input
  const [whatever, title, subtitle] = [...input.matchAll(/\\title\{(.+?)\. (.*?)\}/gms)][0].map(
    (x) => x.replace('/\n/gm', ''),
  )
  const author = [...input.matchAll(/\\author\{(.+?)\}/g)][0][1]
  text = text.replace(/\\documentclass.*?\\section/gms, '\\section')
  text = text.replaceAll(/\\hfill\\break/g, '')
  return [text, author, title, subtitle]
}

const convert = async ({
  input,
  interactive,
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
  //bibliography,
  bibliography = `${input.slice(0, -5).bib}`,
  book,
  directory,
  pubpub,
  spanish,
}) => {
  const docx = input.slice(-5, -1) === 'docx'
  const file = `${input.slice(0, docx ? -5 : -4)}`
  const dirpath = path.dirname(fs.realpathSync(input))
  const args = ['-f', 'docx', '-t', 'latex', '-o', `${dirpath}/temp.tex`, '--extract-media=media']
  const miscargs = [
    received,
    accepted,
    published,
    crossmark,
    bibliography,
    doi,
    running,
    type,
    citation,
  ].map((m) => m ?? 'TOBEFILLEDIN')

  const cheerioXml = docx && (await docxConversion(input, args))
  const tables = docx ? await convertTables(cheerioXml) : ''
  const inp = docx ? `${dirpath}/temp.tex` : input

  let convData = fs.readFileSync(inp, { encoding: 'utf8' })

  convData = replaceFootnotes(convData)
  fs.writeFileSync('footnoets.tex', convData)
  const [newText, author, title, subtitle] = pubpubClean(convData)
  convData = newText
  const boiler = book ? bookBoilerplate : joteBoilerplate
  convData = `
    ${boiler}\n
    ${convData}\n
\\end{document}`

  //Easy regex, just simple find replace
  convData = simpleRegexes(convData, pubpub, spanish)
  // complex regex: find something, then put it somewhere else
  // Object.values(complexRegexes).forEach((section) => {
  //   section['match'].forEach((regex, index) => {
  //     const match = section['number'][index]
  //       ? Array.from(convData.matchAll(regex)).slice(0, section['number'][index])
  //       : Array.from(convData.matchAll(regex))
  //     if (match.length) {
  //       match.forEach((m) => {
  //         const importantThingy = m[section['replace'][index]]
  //         const wholeGuy = m[0]
  //         convData = convData.replace(section['find'][index], importantThingy)
  //         convData = convData.replaceAll(wholeGuy, '')
  //       })
  //     }
  //   })
  // })

  const regs = finalRegexes(miscargs, file)
  Object.values(regs).forEach((section) => {
    section['find'].forEach((regex, index) => {
      convData = convData.replace(regex, section['replace'][index])
    })
  })

  if (promote) {
    convData = promoteSection(convData)
  }

  tables.length &&
    tables.forEach((table) => {
      convData = convData.replace(/\\begin\{longtable\}.*?\\end{longtable}/gms, table)
    })
  if (!docx) {
    const better = author.replace(/\\and/gm, '\\&')
    convData = convData.replace(/\\author\{(.+?)\}/g, (match, one) => `\\author{${better}}`)
    convData = convData.replace(
      /\\runningauthor\{(.+?)\}/g,
      (match, one) => `\\runningauthor{${better}}`,
    )
    convData = convData.replace(/\\jotetitle\{(.+?)\}/g, (match, one) => `\\jotetitle{${title}}`)
    convData = convData.replace(/\\jotesubtitle\{(.+?)\}/g, () => `\\jotesubtitle{${subtitle}}`)
    const doi = `https://doi.org/10.26116/secondthoughts-sie-engelen-openpresstiu-2021-${better.replace(
      /[A-Z]\w+ ([A-Z][^\s]*)(([^A-Z]*)([A-Z])\w+? ([A-Z]\w+))?/g,
      (match, one, two, three, four, five) => {
        const second = five ? `-${five}` : ''
        return `${lowerCase(one)}${lowerCase(second)}`
      },
    )}`
    convData = convData.replace(
      /\\paperfancycite\{(.+?)\}/g,
      () =>
        `\\paperfancycite{${better.replace(
          /([A-Z])(\w+?) ([A-Z][^\s]*)[^A-Z]*([A-Z])?(\w+)? ?([A-Z]\w+)?/g,
          (match, initial, restfirst, last, seci, secfist, secname) => {
            const second = seci ? ` \\& ${seci}. ${secname}` : ''
            return `${last}, ${initial}.${second}`
          },
        )} (${2021}), \\textit{${sentenceCase(title)}: ${sentenceCase(
          subtitle,
        )}} in B. Engelen \\& M. Sie (Eds.), \\textit{Second thoughts: First introductions to philosophy} (pp. XX-YY). Open Press TiU. \\url{${doi}}.}`,
    )
    convData = convData.replace(
      /\\papercite\{(.+?)\}/g,
      () =>
        `\\papercite{${better.replace(
          /([A-Z])(\w+?) ([A-Z][^\s]*)[^A-Z]*([A-Z])?(\w+)? ?([A-Z]\w+)?/g,
          (match, initial, restfirst, last, seci, secfist, secname) => {
            const second = seci ? ` \\& ${seci}. ${secname}` : ''
            return `${last}, ${initial}.${second}`
          },
        )} (${2021}), ${sentenceCase(title)}: ${sentenceCase(
          subtitle,
        )} in B. Engelen \\& M. Sie (Eds.), Second thoughts: First introductions to philosophy (pp. XX-YY). Open Press TiU. ${doi}.}`,
    )
    convData = convData.replace(
      /\\paperdoi\{\w+\}/g,
      `\n\\paperdoi{${doi}
      }\n`,
    )
  }

  const bib = fs.readFileSync(bibliography, { encoding: 'utf8' })
  if (interactive) {
    convData = addFullCite(convData, bib)
  }
  const output = `${directory}/${file}.tex`
  fs.writeFileSync(output, convData)
  console.log('Cleaning up.')
  if (docx) {
    fs.unlinkSync('temp.tex', (err) => {
      console.error(err)
    })
  }
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

const recite = ({ input, bibliography }) => {
  let tex = fs.readFileSync(input, { encoding: 'utf8' })

  const bib = bibliography || `${input.slice(0, -4).bib}`
  const bibstring = fs.readFileSync(bib, { encoding: 'utf8' })
  tex = addFullCite(tex, bibstring)
  fs.writeFileSync(input, tex)
}

program
  .command('convert')
  .description('just do what I want')
  .option('-a, --accepted <input>', 'The date the paper was accepted, D Month, YYYYY')
  .option(
    '-b, --bibliography <input>',
    'Custom bibliography file to use. Will otherwise default to the\n filename + bib',
  )
  .option('--book', 'Book instead of article')
  .option('-c, --crossmark <input>', 'The date for crossmark, YYYYY-MM-DD')
  .option('--doi <input>', 'The doi of the paper, just the suffix.')
  .option('-d, --directory <input>', 'Directory to do the output.')
  .option('-i, --input <input>', 'The input file in .docx')
  .option('--interactive', 'Add tooltips with the full citation')
  .option('-p, --published <input>', 'The date the paper was published, D Month, YYYYY')
  .option('--pubpub', 'Prepare file for pubpub export.')
  .option('-r, --received <input>', 'The date the paper was received, D Month, YYYYY')
  .option('--references', 'refs')
  .option('--spanish', "Be mindful of citations such as 'Bautista Perpinya (2017)'")
  .option('-t, --type <input>', 'The type of the paper.')
  .option('--running <input>', 'The running head')
  .option('--citation <input>', 'The citation style. Either authordate or numeric')
  .option('--compile', 'Whether to compile the pdf')
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
  .command('recite')
  .option('-i, --input <input>', 'The input file in tex')
  .option(
    '-b, --bibliography <input>',
    'Custom bibliography file to use. Will otherwise default to the\n filename + bib',
  )
  .action(recite)
// //program
//   .command('cheerio')
//   .option('-i, --input <input>', 'The input file in .docx')
//   .option('--tables', 'Convert the tables to LaTeX')
//   .option('--ref', 'Get a plaintext list of the references, sort of.')
//   .option('--cite', 'Steal the references from this hardworking researcher.')
//   .option(
//     '-f, --format <input>',
//     'The citation bib format. Defaults to bibtex. Options are those of CitationJS',
//   )
//   .action(cheer)
program.parse()
