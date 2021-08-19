#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
const nodePandoc = require("node-pandoc-promise");
const { joteBoilerplate } = require("./jote-boilerplate");
const https = require('https')
const FormData = require('form-data')
const { program } = require("commander");
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const regexes = {
  misc: {
    find: [/\\textbf\{\\hfill\\break\n\}/gm, /\~([A-Z])/gm, /\.\~/gm],
    replace: ["", " $1", ". "],
  },
  lines: {
    find: [/(?<!([\.\?\!\}\%\)]\n)|([\.\%]))\n/gm, / +/gm],
    replace: ["$1 ", " "],
  },
  citations: {
    find: [
      /([A-Z]\w+,? )and( [A-Z][\w\u00E9\']+,?) (\(?\d{4}\)?)/gm,
      /(?<=(\d ?)); ([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\13)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?, (\d{4}),? ?(p+\. ?\d+ *)?(\))?/gm,
      /\(([\w ]*)(?=; ?)?(; ?)?([a-z, ]*)? ?([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\14)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?, (\d{4}),? ?(p+\. ?\d+ *)?(,\w+\d{4})*\)/gm,
      /([A-Z]\. ?)*(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)((, (([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)(?=,)))*(,? \\\& )?(?<=\12)(([A-Z][\w\u00E9]*)((?:( |-|\'))[A-Z][\w\u00E9]*)*)?( et al\.)?(\'s)? \((\d{4})\)/gm,
    ],
    replace: [
      "$1\\&$2 $3",
      ",$3$19$21",
      // TODO replace nptextcite parencite or a more manual approach, pubpub does not pick up nptextcite
      "($1$2\\nptextcite[$22]{$5$21$23})",
      "\\textcite{$2$19}$18",
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
      "\n\\addcontentsline{toc}{section}{$2}\n\\section{$2}\n\n",
      "\n\\addcontentsline{toc}{$1}{$2}\n\\$1{$2$3}\n\n",
      "\\printbibliography\n\n",
      "\n\\addcontentsline{toc}{$1}{$3}\n\\$1{$3}\n\n",
    ],
  },
};

const complexRegexes = {
  footnotes: {
    match: [
      /(?<=(\\protect\\hypertarget\{fn-(\d)-bottom\}\{\}\{\{\{\}\{\}\}\} \n))(.*)\n/gm,
    ],
    find: [/\\protect\\hypertarget\{\w+\}\{\}\{(\d+)\}/gm],
    replace: ["\\footnote{${match[index][3]}}"],
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
};

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
});

const promoteSection = (convData) => {
  let temp;
  temp = convData.replaceAll(/\\section/gm, "\\chapter");
  temp = temp.replaceAll(/\{section\}/gm, "chapter");
  temp = temp.replaceAll(/subsection/gm, "section");
  temp = temp.replaceAll(/\\paragraph\{/gm, "\\subsection{");
  temp = temp.replaceAll(/\{paragraph\}/gm, "{subsection}");
  temp = temp.replaceAll(/\{subparagraph\}/gm, "{paragraph}");
  return temp;
};

const convert = async ({
  input,
  promote,
  received,
  accepted,
  published,
  crossmark,
  type = "empirical",
  citation = "authordate",
  doi,
  running,
  engine = "xelatex",
}) => {
  console.log(input);
  const dirpath = path.dirname(await fs.promises.realpath(input));
  const args = [
    "-f",
    "docx",
    "-t",
    "latex",
    "-o",
    `${dirpath}/temp.tex`,
    "--extract-media",
  ];
  const miscargs = [
    received,
    accepted,
    published,
    crossmark,
    `${input.slice(0, -5)}.bib`,
    doi,
    running,
    type,
    citation,
  ].map((m) => m ?? "TOBEFILLEDIN");
  try {
    await nodePandoc(input, args);
  } catch (e) {
    console.log("oop");
    console.error(e);
  }
  fs.promises
    .readFile(`${dirpath}/temp.tex`, { encoding: "utf8" }, (err, data) => { })
    .then((res) => {
      //Easy regex, just simple find replace
      let convData = res;
      Object.values(regexes).forEach((section) => {
        section["find"].forEach((regex, index) => {
          convData = convData.replaceAll(regex, section["replace"][index]);
        });
      });
      return convData;
    })
    .then((res) => {
      return (
        joteBoilerplate +
        res +
        `
\\end{document}`
      );
    })
    .then((res) => {
      // complex regex: find something, then put it somewhere else
      let convData = res;
      Object.values(complexRegexes).forEach((section) => {
        section["match"].forEach((regex, index) => {
          const match = section["number"][index]
            ? Array.from(convData.matchAll(regex)).slice(
              0,
              section["number"][index]
            )
            : Array.from(convData.matchAll(regex));
          if (match.length) {
            match.forEach((m) => {
              const importantThingy = m[section["replace"][index]];
              const wholeGuy = m[0];
              convData = convData.replace(
                section["find"][index],
                importantThingy
              );
              convData = convData.replaceAll(wholeGuy, "");
            });
          }
        });
      });
      return convData;
    })
    .then((res) => {
      const regs = finalRegexes(miscargs);
      let convData = res;
      Object.values(regs).forEach((section) => {
        section["find"].forEach((regex, index) => {
          convData = convData.replace(regex, section["replace"][index]);
        });
      });
      return convData;
    })
    .then((res) => {
      if (promote) {
        const convData = promoteSection(res);
        return convData;
      }
      return res;
    })
    .then((res) => {
      fs.writeFile(input.substring(0, input.length - 4) + "tex", res, (err) =>
        console.log("File succesfully converted")
      );
    })
    .then(() => {
      // fs.unlink("temp.tex", (err) => { console.error(err) })
    }).then(() => {
      const file = `${input.slice(0, -5)}.pdf`
      console.log("Generating bibliography from pdf")

      const formData = new FormData()
      formData.append('input', fs.createReadStream(`${dirpath}/${file}`))
      formData.append('consolidateCitations', '1')

      const options = {
        method: "POST",
        host: 'cloud.science-miner.com',
        path: '/grobid/api/processReferences',
        protocol: 'https:',
        headers: {
          "Accept": "application/x-bibtex",
          // "Request type": "multipart/form-data",
        }
      }
      //const req = https.request(
      formData.submit(options,
        (err, res) => {
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', async (chunk) => {
            let data = await chunk
            const chunks = [...data.matchAll(/\@.+?\n\}\n?/gms)].flat()
            const num = /\@(\w+)\{(\d+)/g
            const dt = /date = \{(\d\d\d\d)[^\}]*\}/g
            const auth = /author = \{(\w+)/g
            const newChunks = chunks.map((ch, index) => {
              const date = [...ch.matchAll(dt)][0]
              const author = [...ch.matchAll(auth)][0]
              if (!date?.length || !author?.length) {
                return
              }
              const chun = ch.replace(num, `\@$1\{${author[1]}${date[1]}`)
              const chu = chun.replace(dt, `date = \{${date[1]}\}`)
              console.log(chu)
              return chu
            })
            await fs.promises.writeFile(
              `${dirpath}/${input.slice(0, -5)}.bib`, newChunks.join('\n'))
          });
          res.on('end', () => {
            console.log('Extracted citations.');
          });
          if (err) {
            console.error(err)
          }
        });
    }).then(() => {
      try {
        exec(`latexmk -${engine} --synctex=1 -interaction=nonstopmode  -file-line-error  ${input.slice(0, -5)}.tex -jobname=${input.slice(0, -5)}-conv.pdf`)
      } catch (e) {
        console.log(`Something went wrong while generating the pdf, probably because you either
don't have the correct files in the correct folder, don't have latexmk, xelatex or biber
installed/on your path, or you don't have the correct fonts.`)
        console.error(e)
        console.log(`You can always manually copy the .tex and .bib into overleaf.`)
      }
    })
};

const promote = ({ input }) => {
  fs.promises
    .readFile(input, { encoding: "utf8" }, (err, data) => { })
    .then((res) => {
      let convData = res;
      promoteSection(convData);
    })
    .then((res) => {
      console.log(res);
      fs.writeFile(input.substring(0, input.length - 4) + "tex", res, (err) =>
        console.log("ayy")
      );
    });
};

program
  .command("convert")
  .description("just do what I want")
  .option("-i, --input <input>", "The input file in .docx")
  .option(
    "-r, --received <input>",
    "The date the paper was received, D Month, YYYYY"
  )
  .option(
    "-a, --accepted <input>",
    "The date the paper was accepted, D Month, YYYYY"
  )
  .option(
    "-p, --published <input>",
    "The date the paper was published, D Month, YYYYY"
  )
  .option("-c, --crossmark <input>", "The date for crossmark, YYYYY-MM-DD")
  .option("-t, --type <input>", "The type of the paper.")
  .option("-d, --doi <input>", "The doi of the paper, just the suffix.")
  .option("--running <input>", "The running head")
  .option(
    "--citation <input>",
    "The citation style. Either authordate or numeric"
  )
  .option("-p, --pdf <input>", "A pdf version of the docfile to generate citations.")
  .option("--promote", "Whether to promote all headlines by 1")
  .option("--engine <input>", "Which LaTeX engine to use. Defaults to XeLaTeX. Options: pdf xelatex lualatex")
  .action(convert);

program
  .command("promote")
  .description("promote all sections with one")
  .option("-i, --input <input>", "The input file in .tex")
  .action(promote);
program.parse();
