(TeX-add-style-hook
 "jote-article"
 (lambda ()
   (TeX-add-to-alist 'LaTeX-provided-class-options
                     '(("article" "twoside")))
   (TeX-add-to-alist 'LaTeX-provided-package-options
                     '(("xcolor" "table") ("url" "hyphens") ("tcolorbox" "breakable" "skins" "most") ("lineno" "switch" "right") ("mdframed" "framemethod=tikz" "framemethod=default") ("unicode-math" "partial=upright") ("fontenc" "T1") ("inputenc" "utf8") ("sourcesanspro" "semibold" "default") ("newtxsf" "cmintegrals" "nosymbolsc") ("titlesec" "explicit") ("footmisc" "flushmargin" "bottom" "norule" "marginal") ("enumitem" "inline") ("caption" "tableposition=top") ("biblatex" "backend=biber" "citestyle=numeric-comp" "sorting=none" "bibstyle=apa" "style=apa")))
   (TeX-run-style-hooks
    "latex2e"
    "numeric"
    "article"
    "art10"
    "booktabs"
    "xcolor"
    "ifpdf"
    "ifxetex"
    "ifluatex"
    "mathtools"
    "bm"
    "graphicx"
    "tabularx"
    "tabulary"
    "textcase"
    "dashrule"
    "ragged2e"
    "authblk"
    "url"
    "soul"
    "xpatch"
    "afterpage"
    "setspace"
    "hyperref"
    "paracol"
    "pdfcomment"
    "tikz"
    "lipsum"
    "lmodern"
    "tcolorbox"
    "lineno"
    "mdframed"
    "silence"
    "microtype"
    "unicode-math"
    "fontenc"
    "inputenc"
    "tgtermes"
    "sourcesanspro"
    "stix"
    "newtxsf"
    "alphalph"
    "scalerel"
    "scrextend"
    "titlesec"
    "footmisc"
    "fancyhdr"
    "changepage"
    "environ"
    "marginnote"
    "quoting"
    "enumitem"
    "caption"
    "threeparttable"
    "stfloats"
    "newfloat"
    "enotez"
    "biblatex"
    "amsrefs"
    "lettrine"
    "wrapfig"
    "ftnright")
   (TeX-add-symbols
    '("otherinfo" ["argument"] 1)
    '("contrib" ["argument"] 1)
    '("allcaps" ["argument"] 1)
    '("presentadd" ["argument"] 1)
    '("thead" 1)
    '("keywords" 1)
    '("abbrevs" 1)
    '("blfootnote" 1)
    '("orcidicon" 1)
    '("prround" 1)
    '("ogauthor" 1)
    '("authorfive" 1)
    '("authorfour" 1)
    '("authorthree" 1)
    '("authortwo" 1)
    '("authorone" 1)
    '("noabstract" 1)
    '("keywordsabstract" 1)
    '("interests" 1)
    '("contributions" 1)
    '("acknowledgments" 1)
    '("funding" 1)
    '("paperfield" 1)
    '("papertype" 1)
    '("papereditor" 1)
    '("paperpublisheddate" 1)
    '("paperpublished" 1)
    '("paperaccepted" 1)
    '("paperrevised" 1)
    '("paperreceived" 1)
    '("paperdoi" 1)
    '("fundinginfo" 1)
    '("rgainfo" 1)
    '("corremail" 1)
    '("corraddress" 1)
    '("runningauthor" 1)
    '("subtitle" 1)
    '("rolling" 1)
    '("widthaffil" 1)
    '("heightabstract" 1)
    '("abstracttext" 1)
    '("companionkey" 1)
    '("companionabstract" 1)
    '("companiontitle" 1)
    '("companionurl" 1)
    '("pubpub" 1)
    '("jwebsite" 1)
    '("jpages" 1)
    '("jissue" 1)
    '("jvolume" 1)
    '("jyear" 1)
    '("jname" 1)
    '("jlogo" 1)
    '("authfn" 1)
    "jotebar"
    "gotoreview"
    "checkedbox"
    "backmatter"
    "more"
    "jote"
    "thefpfootnotes"
    "qed"
    "headrow"
    "cleartoleftpage"
    "boldsymbol"
    "checkmark"
    "oldclearpage"
    "clearpage"
    "citep"
    "citet")
   (LaTeX-add-environments
    '("biography" LaTeX-env-args ["argument"] 1)
    '("remark" LaTeX-env-args ["argument"] 0)
    '("example" LaTeX-env-args ["argument"] 0)
    '("definition" LaTeX-env-args ["argument"] 0)
    '("proof" LaTeX-env-args ["argument"] 0)
    '("graphicalabstract" 1)
    '("epigraph" 1)
    "pullquote"
    "theorem"
    "lemma"
    "proposition"
    "corollary")
   (LaTeX-add-counters
    "authorfn")
   (LaTeX-add-lengths
    "jote"))
 :latex)

