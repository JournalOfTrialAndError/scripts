module.exports = {
  joteBoilerplate: `% Document class options:
% =======================
%
% lineno: Adds line numbers.
%
% serif: Sets the body font to be serif.
%
% twocolumn: Sets the body text in two-column layout.
%
% Fill in the type of article here! Capitalization matters!
%% Options
% empirical
% reflection
% meta-Research
% rejected Grant Application
% editorial
%
% Using other bibliography styles:
% =======================
% authordate: Author et. al (2021)
% numeric:    [1-5]


\\documentclass[10pt, twocolumn, citationstylemarker, typemarker, header]{jote-new-article}


%%% Add the bibliography, make sure it's in the same directory
\\addbibresource{bibmarker}

%%% Add additional packages here if required. Usually not needed, except when doing things with figures and tables, god help you then

% This package is for generating Lorem Ipsum, usage: \\lipsum[X] where X is the Xth paragraph of lorem ipsum. OR use [1-5] to generate the first five, etc.
\\usepackage{kantlipsum}


% Enter the title, in Title Case Please
% Try to keep it under 3 lines
\\jotetitle{titlemarker}
%\\jotetitle{Oh No! My Experiment Went Kaput!\\\\ And now my title as well! \\\\Even more text because I do not read the requirements of the journal!\\\\ Now it looks even worse!!!}

% List abbreviations here, if any. Please note that it is preferred that abbreviations be defined at the first instance they appear in the text, rather than creating an abbreviations list.
%\\abbrevs{ABC, a black cat; DEF, doesn't ever fret; GHI, goes home immediately.}

% Include full author names and degrees, when required by the journal.
% Use the \\authfn to add symbols for additional footnotes and present addresses, if any. Usually start with 1 for notes about author contributions; then continuing with 2 etc if any author has a different present address.
\\author[1]{Author One\\orcid{345324523235}}
%Fill it in again for the PDF metadata. Lame workaround but it works
\\authorone{Author One}

\\author[1, 2]{Author Two\\orcid{siotenasoiet}}
\\authortwo{Author Two}

%List the contribution effort here, they will be listed at the end of the page
\\contributions{Author One did all the work, while Author Two was just slacking.}
%List the acknowledgments. If there is no companion piece, this is listed below the author info
\\acknowledgments{Author Two would like to thank Author One for doing all the work while they could slack off.}
%List possible conflict of interest. Will default to saying no conflict exists.
\\interests{Author One was paid for by Big Failed Experiment}
%List funding
\\funding{}
% Include full affiliation details for all authors
\\affil[1]{Department of Error, University of Trial, USA USA USA}
\\affil[2]{The streets}

% List the correspondence email of the main correspondent
\\corraddress{Author One, Paradise City}
\\corremail{\\href{mailto:author@one.com}{author@one.com}}

% Optionally list the present address of one of the authors
%\\presentadd[\\authfn{2}]{Department, Institution, City, State or Province, Postal Code, Country}

% Fill in the DOI of the paper

% Always starts with "10.36850/" and is suffixed with one of the following plus a number
% e  : empirical
% r  : reflection
% mr : meta-research
% rga: rejected grant application
% ed : editorial
\\paperdoi{10.36850/doimarker}

% Include the name of the author that should appear in the running header
\\runningauthor{Name et al.}

% The name of the Journal
\\jname{Journal of Trial \\& Error}

% The year that the article is published
\\jyear{2021}

%The Volume Number
%\\jvolume{Fall}

%The website that's listed in the bottom right
\\jwebsite{https://www.jtrialerror.com}

%%% Only \\paperpublished is necessary, any combination of the other two is possible

%When the paper was received
\\paperreceived{receivedmarker}
% When the paper was accepted
\\paperaccepted{acceptedmarker}
% When the paper will be published
\\paperpublished{publishedmarker}
% When the paper is published but in YYYY-MM-DD format, for the crossmark button
\\paperpublisheddate{crossmark}

% The pages of the article, comment out if rolling article
%\\jpages{1-12}
% Link to the logo, might be redundant
\\jlogo{media/jote_logo_full.png}

% Fill something here if this is a rolling/online first article, will make ROLLING ARTICLE show up on the first page
%\\rolling{YES}

% Sets the paragraph skip to be zero, this should be in the CLS
\\setlength{\\parskip}{0pt}

%%% Companion Piece

% Reflection and Empirical articles have each other as companion pieces. Add the DOI, Title, and Abstract of the respective Companion piece here
\\companionurl{https://doi.org/10.36850/rX}
\\companiontitle{Author Three (2020)\\newline Very Serious Reflection}
\\companionabstract{\\noindent \\lipsum[6]}

%%% Abstract

%Enter something here in order for the abstract to disappear. Be sure to also delete the abstract
\\noabstract{}
% Fill in the keywords that will appear in the abstract, max 7
\\keywordsabstract{a, b, c, d, e, f, g}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%Document Starts
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}
%%% This starts the frontmatter, which includes everything that's on the front page execpt the text of the article
\\begin{frontmatter}
\\maketitle
%Type your abstract between these things. Max 250 words. Be sure to include the \\noindent, looks bad otherwise
\\begin{abstract}
abstractmarker
\\end{abstract}
\\end{frontmatter}


%% Purpose


\\begin{company}%
\\begin{tcolorbox}[enhanced, sharp corners, colback=joteorange!35, frame hidden, top= .9\\smallwidth, bottom=.8\\smallwidth, left skip = .5em, borderline west={1em}{-0em}{joteorange}, boxrule=0pt, lower separated=false]%
  \\raggedright%
  \\textbf{Companion Article}
\\vskip.25\\smallwidth
Nederbragt, H., (2021)

\\textit{Ponies, Joints, Complexity and the Method of Indifference.}
\\vskip.25\\smallwidth
\\href{https://doi.org/10.36850/r3}{https://doi.org/10.36850/r3}
\\end{tcolorbox}
\\end{company}
`
}
