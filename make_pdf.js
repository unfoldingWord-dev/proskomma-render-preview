const fse = require('fs-extra');
const path = require('path');
const {doRender, peripheralMatches, bookMatches} = require("./makeHtmlPreview");
const { Proskomma } = require('proskomma');
const doRenderUSFM = require("./index");

if (process.argv.length !== 4) {
    throw new Error("USAGE: node make_pdf.js <configPath> <htmlOutputPath>");
}

const configPath = path.resolve(__dirname, process.argv[2]);
const config = fse.readJsonSync(configPath);
config.codeRoot = __dirname;
config.configRoot = path.dirname(configPath);
config.outputPath = process.argv[3];
if (!config.outputPath) {
    throw new Error("USAGE: node make_pdf.js <configPath> <htmlOutputPath>");
}
config.bookOutput = {};

let ts = Date.now();
let nBooks = 0;
let nPeriphs = 0;

const pk = new Proskomma();
const fqSourceDir = path.resolve(config.configRoot, config.sourceDir);
pk.importUsfmPeriph = function (param, content, param3) {
  
}
for (const filePath of fse.readdirSync(fqSourceDir)) {
    if (bookMatches(filePath, config)) {
        console.log(`   ${filePath} (book)`);
        nBooks++;
        const content = fse.readFileSync(path.join(fqSourceDir, filePath));
        const contentType = filePath.split('.').pop();
        pk.importDocument(
            {lang: "xxx", abbr: "yyy"},
            contentType,
            content,
            {}
        );
    } else if (peripheralMatches(filePath, config)) {
        console.log(`   ${filePath} (peripheral)`);
        nPeriphs++;
        let content = fse.readFileSync(path.join(fqSourceDir, filePath));
        pk.importUsfmPeriph(
            { lang: 'xxx', abbr: 'yyy' },
            content,
            {},
        );
    }
}
console.log(`${nBooks} book(s) and ${nPeriphs} peripheral(s) loaded in ${(Date.now() - ts) / 1000} sec`);
ts = Date.now();

doRender(pk, config, ts).then((res) => {
    // console.log(JSON.stringify(config, null, 2));
});

const usfm = fse.readFileSync(path.join('./test/test_data/ult/usfm/44-JHN.usfm');

doRenderUSFM(usfm).then(html => {
  console.log(html);
})
