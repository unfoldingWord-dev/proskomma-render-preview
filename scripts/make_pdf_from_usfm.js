import fse from 'fs-extra';
import path from 'path';
import _ from "lodash";
import appRootPath from "app-root-path";
import {doRender} from '../index.js';

const appRoot = appRootPath.toString();
const CONFIG = fse.readJsonSync('./config/config_single.json');

import {Proskomma} from 'proskomma';
import {
    ScriptureParaModel,
    ScriptureParaModelQuery
} from 'proskomma-render';
import MainDocSet from '../MainDocSet.js';

let ts = Date.now();
const pk = new Proskomma();

const content = fse.readFileSync(path.join('./test/test_data/ult/usfm/44-JHN.usfm'));
const bookID = 'JHN';
const contentType = 'usfm';

const config = _.cloneDeep(CONFIG);
config.structure = [
  [
    "section",
    "nt",
    [
      [
        "bookCode",
        bookID
      ]
    ]
  ]
];

config.codeRoot = appRoot;
// config.configRoot = path.dirname(configPath);
// config.outputPath = path.resolve(process.argv[3]);
// if (!config.outputPath) {
//     throw new Error("USAGE: node make_pdf.js <configPath> <htmlOutputPath>");
// }
config.bookOutput = {};


pk.importDocument(
    {lang: "xxx", abbr: "yyy"},
    contentType,
    content,
    {}
);

const config2 = await doRender(pk, config);
console.log(`1 book loaded in ${(Date.now() - ts) / 1000} sec`);
fse.writeFileSync('./output.html', config2.output);

