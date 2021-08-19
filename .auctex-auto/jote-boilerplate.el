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
    "adjustbox"))
 :latex)

