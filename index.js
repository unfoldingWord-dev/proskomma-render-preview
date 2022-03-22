import fse from "fs-extra";
import {doRender} from "./makeHtmlPreview";

const doRenderHtml = async (pk, config = {}) => {
  const ts = Date.now();
  const configDefault = fse.readJsonSync('./config/config_ult.json');
  const config_ = {
    ...configDefault,
    ...config,
  }
  const html = await doRender(pk, config, ts);
  return html
}

module.exports = {
  doRenderHtml,
};
