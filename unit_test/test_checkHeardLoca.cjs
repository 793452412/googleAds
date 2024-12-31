const cheerio = require('cheerio');
const { getReplaceUrl, getProxyAgentByAreaCode,getRedirectHeaders, checkHeardLoca} = require('../util3nextAndreplace.js');
const { urlencoded } = require('express');
const { bulidHeards } = require('../util3nextAndreplace.js');
const {getDataByRe} = require("../getRe/getDataByRe.js"); // CommonJS 语法需用 require

const proxyInfo = {
    username: 'uPc6yO0KYBKFK7Ba',
    password: 'K2EMHhDpaaFVryse_country-us',
    host: 'geo.iproyal.com',
    port: '12321',
};

(async () => {
    try {
        console.log("=================================================================================================");

        const heard = await bulidHeards("www.baidu.com"); // 不设置则为空
        const proxy = await getProxyAgentByAreaCode(proxyInfo);
        const url = 'https://yeahpromos.com/index/index/openurl?track=8545d380cc57fa27&url=';
        const res = await getRedirectHeaders(url,proxy,heard);
        const c = await checkHeardLoca(url,proxy,heard)
        console.log(c)
    } catch (error) {
        console.error("Error occurred:", error);
    }
})();
