import {Proskomma} from "proskomma";
import _ from "lodash";
import {doRender} from "./index.js";
import appRootPath from "app-root-path";

const appRoot = appRootPath.toString();
const SINGLE_BOOK_CONFIG = {
  "title": "unfoldingWord Literal Translation",
  "language": "en",
  "textDirection": "ltr",
  "uid": "ULT",
  "structure": [
    [
      "section",
      "nt",
      [
        [
          "bookCode",
          "%bookID%"
        ]
      ]
    ]
  ],
  "i18n": {
    "notes": "Notes",
    "tocBooks": "Books of the Bible",
    "titlePage": "unfoldingWord Literal Translation: Psalms and Gospels",
    "copyright": "Licensed under a Creative Commons Attribution-Sharealike 4.0 International License",
    "coverAlt": "Cover",
    "preface": "Preface",
    "ot": "Old Testament",
    "nt": "New Testament"
  }
};

async function renderUsfmToHTML(usfm, bookID, htmlTitle, language, direction, i18n) {
  const pk = new Proskomma();
  const contentType = 'usfm';
  const structure = [
    [
      "bookCode",
      bookID
    ]
  ];

  const config = {
    ...SINGLE_BOOK_CONFIG,
    title: htmlTitle,
    textDirection: direction,
    structure,
    i18n,
  };
  
  config.bookOutput = {};

  pk.importDocument(
    {lang: "xxx", abbr: "yyy"},
    contentType,
    usfm,
    {}
  );

  const config2 = await doRender(pk, config);
  return config2.output;
}

export {renderUsfmToHTML}