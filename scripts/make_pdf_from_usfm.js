import fse from 'fs-extra';
import path from 'path';
import {renderUsfmToHTML} from "../lib/index.js";

let ts = Date.now();

const usfm = fse.readFileSync(path.join('./test/test_data/ult/usfm/44-JHN.usfm'));
const bookID = 'JHN';
const htmlTitle = 'John Preview';
const language = 'en';
const direction = 'ltr';
const i18n = {
  "notes": "Notes",
  "tocBooks": "Books of the Bible",
  "titlePage": "John Preview",
  "copyright": "Licensed under a Creative Commons Attribution-Sharealike 4.0 International License",
  "coverAlt": "Cover",
  "preface": "Preface",
  "ot": "Old Testament",
  "nt": "New Testament"
}

const html = await renderUsfmToHTML(usfm, bookID, htmlTitle, language, direction, i18n);

console.log(`1 book loaded in ${(Date.now() - ts) / 1000} sec`);
fse.writeFileSync('./output.html', html);
