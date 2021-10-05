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
const bookBoilerplate = require('./book-boilerplate')
const chapterBoilerplate = require('./chapter-boilerplate')
const { getDocxXml, convertTables, extractCites, convertReferences } = require('./cheerio')
const { sentenceCase, titleCase, lowerCase } = require('change-case-all')
const getCorrectKey = require('./get-correct-key')
const dois = require('/home/thomas/COTE/Tilburg/dois')
const authorData = require('/home/thomas/COTE/Tilburg/authordata')
const puppet = require('./puppeteer')
const citationPuppet = require('./citationpuppet')

const citationRegexes = (text, pubpub, spanish) => {
  let data = text
  const citations = {
    find: [
      // if you want to unedrstand how these things find things, plug them into
      // regexr.com. Just trust me tho
      // get rid of ands, make them \&s. Easier to parse
      /([A-Z]\w+,? )and( [A-Z][\w\u00E9\']+,?) (\(?\d{4}\)?)/gm,
      // find the ; Guy, 2021) part of a (Dude, 1990; Guy, 2021) citation
      /(?<=(\d ?))(;|,) ([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\13)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?,? (\d{4}|\d+ [A-Z\.]+),? ?(p+\. ?\d+ *)?(\))?/gm,
      // find the (Dude 1990; part. Handles A lot, such as (see Dude 1990), (ASHT; Dude, 1990), (Dude, 1990, pp.234)
      // (D'Ude McOnnell 1990)
      /\(([\w\.\- ]*)(?=; ?)?(; ?)?([a-z, ]*)? ?(([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\14)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?),? (\d{4}|\d+ ?[A-Z\.]+)(\/\d{4})?( ?\{\[\}.+?\{\]\})?([,\:] ([^\;\,\)]*))?(\;|\))/gms,
      // Find in text citations. This one fucks up the most, because there's no way to determine whether to
      // take the "Whereas" in "Whereas Bentham (1688) says you are evil" as a name or not, because the
      // fucking spanish have names like Bautista Perpinya. That's why there is the spanish toggle.
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
        return `(${prefix}\\pdftooltip{{\\color{tip}${four},}}{\\fullcite{${six}${correctdate}}} \\citeyear{${six}${correctdate}}${suffix}${paren}`
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
  }

  citations['find'].forEach((regex, index) => {
    data = data.replaceAll(regex, citations['replace'][index])
  })
  return data
}

const simpleRegexes = (text, pubpub, spanish, file) => {
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
    markings: {
      find: [/(\d+)(th|st|nd|rd)/g, /H2O/g],
      replace: ['$1\\textsuperscript{$2}', 'H\\textsubscript{2}O'],
    },
    sections: {
      find: [
        /(?<=(\n|))\\textbf\{([^\}]*)\} ?\n/gm,
        /\\hypertarget\{\w+\}\{\%\n\\(\w+)\\[(\w+)]\{\\texorpdfstring\{\2(\\protect\\hypertarget\{[^\}]*\}\{\}\{\d\})\}\{\2\d\}\}[^\n]\n/gm,
        // /\\hypertarget\{[^\}]*\}\{\%\n\\([^\{]*)\{([^\{]*)\}[^\n]*\n/gm],
        /(\\textbf\{(References|Bibliography)\}|\\section\{(References|Bibliography)\})(.+?(?=(\\textbf|\\addcontentsline|\\end\{document\}|\\contact)))/gms,
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
    moreSections: {
      find: [
        /\\addcontentsline.+?\n/gm, ///section\{\d+[^\w]*([^\}]*)\}/gm
        /1.\n? ?Introduction1?/gm,
        /(Introduction\}\})\}/gm,
        /(Introduction\}?)\\footnote/gm,
        /nocite\{\}/gm,
        /\\section\{Introduction\}\}\n/g,
        /\\textbf\{Introduction\}/g,
        /\\texorpdfstring\{Introduction/g,
        /\\section(.+?)\\footnote\{(.+?)\}.+(Introduction[^\}]*)\}+/g,
        /\\section\{(.+?)\}\}/g,
      ],
      replace: [
        '', //'section{\\MakeSentenceCase{$1}}'
        'Introduction',
        '$1',
        '$1\\protect\\footnote',
        'nocite{*}',
        '\\section{Introduction}\n',
        'Introduction',
        '\\texorpdfstring{Introduction}',
        '\\section{$3}\n\\thanksfootnote{$2}',
        '\\section{$1}',
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

  console.log(data)
  //addd labels
  if (pubpub) {
    return data
  }
  data = data.replaceAll(/\\label\{.+?\}/gms, '')
  sections = [...data.matchAll(/\\section((\[|\{).+?\})/gm)]
  sections.forEach(
    (sec, index) =>
      (data = data.replace(
        sec[0],
        `\\label{sec:${authorData[parseInt(file)][0].last}${index + 1}}\n\\section${sec[1]}`,
      )),
  )
  data = data.replaceAll(/(S?s?ection|§) (\d+)/gm, (string, section, num) => {
    if (!sections.length || !section || !sections[num - 1]) {
      return
    }
    return `\\pdftooltip{{\\color{tip}${section} }}{${num}. ${sections[num - 1][1]}}\\ref{sec:${
      authorData[parseInt(file)][0].last
    }${num}}`
  })
  data = data.replaceAll(
    /(hanksfootnote\{[^\}]*)\}+\ *\n*\ *(\w)(\w*)\s/gms,
    '$1}\n\n\\lettrine{$2}{$3} ',
  )
  data = data.replaceAll(/(\\label\{.+?\})\n*(\\section\{.+?)\}/gms, '$2\n$1}\n')
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

const metaRegexes = (miscargs, file, convData) => {
  let data = convData
  const regs = {
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
  }
  Object.values(regs).forEach((section) => {
    section['find'].forEach((regex, index) => {
      data = data.replace(regex, section['replace'][index])
    })
  })
  return data
}

const metaerRegexes = (author, title, subtitle, data, file, dois) => {
  let convData = data
  if(author){
  const better = author.replace(/\\and/gm, '\\&')
  const authorNames = authorData[file].map((n) => `${n.first} ${n.last}`).join(', ')
  const displayNames = authorData[file].map((n) => `${n.first} ${n.last}`).join(' \\& ')
  const citeNames = authorData[file].map((n, index) => {
    if (index === 0) {
      return `${n.last}, ${n.first.slice(0, 1)}.`
    }
    return `${index < n.length - 1 ? ', ' : ' \\& '}${n.first.slice(0, 1)}. ${n.last}`
  })

  const authorEmails = authorData[file]
    .map((n) => `\\href{mailto:${n.email}}{\\faIcon[open]{envelope}}\\quad`)
    .join('%\n')
  const authorContacts = authorData[file]
    .map((n) => {
      const orcid = n.orcid ? `\\par\\noindent\\aiicon{orcid}\\href{${n.orcid}}{${n.orcid}}` : ''
      return `\\noindent\\textit{${n.first} ${n.last}} \\hfill{  } \\href{mailto:${n.email}}{${n.email}}${orcid}`
    })
    .join('\n')
  convData = convData.replace(
    /\\joteauthor\{(.+?)\}/g,
    (match, one) => `\\joteauthor{${authorNames}}`,
  )
  convData = convData.replace(
    /\\authoremail\{(.+?)\}/g,
    (match, one) => `\\authoremail{${authorEmails}}`,
  )
  convData = convData.replace(
    /\\authorcontact\{(.+?)\}/g,
    (match, one) => `\\authorcontact{${authorContacts}}`,
  )
  convData = convData.replace(
    /\\runningauthor\{(.+?)\}/g,
    (match, one) => `\\runningauthor{${displayNames}}`,
  )
  convData = convData.replace(
    /\\fancypapercite\{(.+?)\}/g,
    () =>
      // `\\fancypapercite{${better.replace(
      //   /([A-Z])(\w+?) ([A-Z][^\s]*)[^A-Z]*([A-Z])?(\w+)? ?([A-Z]\w+)?/g,
      //   (match, initial, restfirst, last, seci, secfist, secname) => {
      //     const second = seci ? ` \\& ${seci}. ${secname}` : ''
      //     return `${last}, ${initial}.${second}`
      //   },
      //
      `\\fancypapercite{${citeNames} (${2021}), \\textit{${sentenceCase(title)}: ${sentenceCase(
        subtitle,
      )}}. In B. Engelen \\& M. Sie (Eds.), \\textit{Second thoughts: First introductions to philosophy} (pp. XX-YY). Open Press TiU. \\url{${doi}}.}`,
  )
  convData = convData.replace(
    /\\papercite\{(.+?)\}/g,
    () =>
      // `\\fancypapercite{${better.replace(
      //   /([A-Z])(\w+?) ([A-Z][^\s]*)[^A-Z]*([A-Z])?(\w+)? ?([A-Z]\w+)?/g,
      //   (match, initial, restfirst, last, seci, secfist, secname) => {
      //     const second = seci ? ` \\& ${seci}. ${secname}` : ''
      //     return `${last}, ${initial}.${second}`
      //   },
      //
      `\\papercite{${citeNames} (${2021}), ${sentenceCase(title)}: ${sentenceCase(
        subtitle,
      )} in B. Engelen \\& M. Sie (Eds.), Second thoughts: First introductions to philosophy (pp. XX-YY). Open Press TiU. ${doi}.}`,
  )
  }
  convData = convData.replace(/\{titlemarker\}/g, (match, one) => `{${title}}`)
  convData = convData.replace(/\\jotesubtitle\{(.+?)\}/g, () => `\\jotesubtitle{${subtitle}}`)
  const doi = dois
    ? `https://doi.org/${dois[parseInt(file) + 1]}`
    : `https://doi.org/10.26116/secondthoughts-sie-engelen-openpresstiu-2021-${better.replace(
        /[A-Z]\w+ ([A-Z][^\s]*)(([^A-Z]*)([A-Z])\w+? ([A-Z]\w+))?/g,
        (match, one, two, three, four, five) => {
          const second = five ? `-${five}` : ''
          return `${lowerCase(one)}${lowerCase(second)}`
        },
      )}`
  convData = convData.replace(
    /\\paperdoi\{\w+\}/g,
    `\n\\paperdoi{${doi}
      }\n`,
  )
  return convData
}
const finalRegexes = (miscargs, file) => ({
  problematic: {
    find: [/ \&/g],
    replace: [' \\&'],
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
  const [whatever, title, subtitle] = [
    ...input.matchAll(/\\title\{(.+?)[\.\?\!\'] (.*?)\}/gms),
  ][0].map((x) => x.replace('/\n/gm', ''))
  const author = [...input.matchAll(/\\author\{(.+?)\}/g)]?.[0]?.[1] || ''
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
  chapter,
  directory,
  pubpub,
  spanish,
	nobib,
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
  const boiler = book ? bookBoilerplate : chapter ? chapterBoilerplate : joteBoilerplate
  convData =
    book || chapter
      ? `${convData}\n
\\contact\%\n\\citeas\%\n\\license\%`
      : `${boiler}\n
    ${convData}\n
\\end{document}`

  //Easy regex, just simple find replace
  convData = simpleRegexes(convData, pubpub, spanish, file)

  convData = citationRegexes(convData, pubpub, spanish)
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

  convData = chapter || book ? convData : metaRegexes(miscargs, file, convData)
  let filledBoiler = metaRegexes(miscargs, file, boiler)

  if (promote) {
    convData = promoteSection(convData)
  }

  tables.length &&
    tables.forEach((table) => {
      convData = convData.replace(/\\begin\{longtable\}.*?\\end{longtable}/gms, table)
    })
  if (!docx) {
    convData = metaerRegexes(author, title, subtitle, convData, file, dois)
    filledBoiler = metaerRegexes(author, title, subtitle, filledBoiler, file, dois)
  }

  const bib = !nobib ? fs.readFileSync(bibliography, { encoding: 'utf8' }) : ''

  // try to replace faulty keys
  convData = convData.replaceAll(
    /(cite\w*\{)([^\s\}\)]+)\}/g,
    (string, cite, key) => `${cite}${getCorrectKey(bib, key)}\}`,
  )

  if (book) {
    convData = convData.replaceAll(/\\end\{document\}/g, '') //'\\end{refsection}')
  }
  if (interactive) {
    convData = addFullCite(convData, bib)
  }
  // the only diff between the book and chapter version is the boilerplate, doesn't make sense to make separate files outta them
  if (book || chapter) {
    const output = `${directory}/${file}${book ? '-book' : '-chap'}.tex`
    fs.writeFileSync(
      output,
      `${filledBoiler}\n\\input{${file}}\n\n${book ? '' : '\\end{document}'}`,
    )
  }

  const regs = finalRegexes(miscargs, file)
  Object.values(regs).forEach((section) => {
    section['find'].forEach((regex, index) => {
      convData = convData.replace(regex, section['replace'][index])
    })
  })
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

// function to rework citations. Does not work after triggering interactive!
const recite = ({ input, check, parse, bibliography, spanish, pubpub, interactive }) => {
  if (input.includes('book') || input.includes('chapter')) {
    console.log(`Not converting book or chapter files, skipping ${input}`)
    return
  }
  let tex = fs.readFileSync(input, { encoding: 'utf8' })

  const bib = bibliography || `${input.slice(0, -4).bib}`
  if(parse){
  tex = citationRegexes(tex, spanish, pubpub)
  }
  if(check){
  tex = tex.replaceAll(
    /(cite\w*\{)([^\s\}\)]+)\}/g,
    (string, cite, key) => `${cite}${getCorrectKey(bib, key)}\}`,
  )
  }
  const bibstring = fs.readFileSync(bib, { encoding: 'utf8' })
  if (interactive) {
    tex = addFullCite(tex, bibstring)
  }
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
  .option('--chapter', 'Chapter instead of article')
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
  .option('--nobib', "Don't do bib stuff")
  .action(convert)

program
  .command('promote')
  .description('promote all sections with one')
  .option('-i, --input <input>', 'The input file in .tex')
  .action(promote)

program.command('docxjs').option('-i, --input <input>', 'The input file in .docx').action(docxjs)
program
  .command('recite')
  .description(
    "Checks all the citations again. Run in the directory of your tex files, will overwrite them.\n Doesn't work after running interactive, as fullcites have textcites.",
  )
  .option('--check', "Try to correct incorrect citations. For instance, look for other keys which could match the current key, e.g. Locke1683 is cited, but the key is Locke1983 with an origdate of 1683. The new citation will then be Locke1983")
  .option('-i, --input <input>', 'The input file in tex')
  .option('--interactive', 'Add tooltips with the full citation')
  .option('--parse', "Try to turn plain text APA citations to latex citations")
  .option('--pubpub', 'Prepare file for pubpub export.')

  .option('--spanish', "Be mindful of citations such as 'Bautista Perpinya (2017)'")
  .option(
    '-b, --bibliography <input>',
    'Custom bibliography file to use. Will otherwise default to the\n filename + bib',
  )
  .action(recite)

program
  .command('puppet')
  .description(
    "Magics it's way into pubpub"
  )
  .option('-t, --tex <input>', 'The input file in tex')
  .option(
    '-b, --bib <input>',
    'The bibliography file to use for the cites',
  )
  .option('-d, --doi <input>', 'The doi of the thing')
  .option('--title <input>', 'The title of the thing')
  .option('-p, --pdf <input>', 'The pdf of the thing')
  .action(puppet)

program.command('cite-puppet')
.description("Fix the citations on a pubppub page")
.option('-t, --texpath <input>', 'Reference tex fille')
.option('-b, --bibpath <input>', 'Bib file')
.option('-d, --destination <input>', 'Destination pub')
.option('-p, --basepath <input>', 'Which pubpub domain you want to log into')
.action(citationPuppet)
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
