const fse = require('fs-extra');
const path = require('path');

const {
    ScriptureParaModel,
    ScriptureParaModelQuery
} = require('proskomma-render');
const MainDocSet = require('./MainDocSet');

const bookMatches = (str, config) => {
    for (const book of config.bookSources) {
        if (str.includes(book) || str.includes(book.toLowerCase())) {
            return true;
        }
    }
    return false;
}

const peripheralMatches = (str, config) => {
    for (const periph of config.peripheralSources) {
        if (str.includes(periph) || str.includes(periph.toLowerCase())) {
            return true;
        }
    }
    return false;
}

const doMainRender = (config, result) => {
    ts = Date.now();
    const model = new ScriptureParaModel(result, config);
    model.addDocSetModel('default', new MainDocSet(result, model.context, config));
    model.render();
    console.log(`Main rendered in  ${(Date.now() - ts) / 1000} sec`);
    console.log(model.logString());
}

const doRender = async (pk, config, ts = Date.now()) => {
    const thenFunction = result => {
        console.log(`Query processed in  ${(Date.now() - ts) / 1000} sec`);
        doMainRender(config, result);
        return config;
    }
    await ScriptureParaModelQuery(pk)
        .then(thenFunction)
};

module.exports = {
  doMainRender,
  doRender,
  bookMatches,
  peripheralMatches,
};