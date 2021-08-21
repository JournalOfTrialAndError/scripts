(TeX-add-style-hook
 "jote-boilerplate"
 (lambda ()
   (TeX-add-to-alist 'LaTeX-provided-class-options
                     '(("jote-article" "twocolumn" "serif" "articletypemarker" "citationstylemarker")))
   (TeX-add-to-alist 'LaTeX-provided-package-options
                     '(("adjustbox" "export")))
   (TeX-run-style-hooks
    "latex2e"
    "jote-article"
    "jote-article10"
    "gensymb"
    "graphicx"
    "adjustbox")
   (LaTeX-add-environments
    '("biography" LaTeX-env-args ["argument"] 1)
    '("remark" LaTeX-env-args ["argument"] 0)
    '("example" LaTeX-env-args ["argument"] 0)
    '("definition" LaTeX-env-args ["argument"] 0)
    '("proof" LaTeX-env-args ["argument"] 0)))
 :latex)

