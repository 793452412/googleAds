import {bulidHeards, getProxyAgentByAreaCode, getReplaceUrl} from "../util3nextAndreplace.js";


const proxyInfo = {
    username: 'uPc6yO0KYBKFK7Ba',
    password: 'K2EMHhDpaaFVryse_country-us',
    host: 'geo.iproyal.com',
    port: '12321',
}
const heard = await bulidHeards("www.baidu.com") //不设置则为空
// const heard = await bulidHeards() //不设置则为空

const nextUrl ='https://www.kfzteile24.de/index.cgi?utm_medium=aff&utm_source=awin&utm_campaign=1363573&utm_content=1363573-7458061679_a~5tofcf6j3fjoafeoxx20241230;k~kfzteile24&icid=10-002&sv1=affiliate&sv_campaign_id=1363573&awc=13928_1735551118_b656821e114ea9230a0950f853534c86'
const proxy = await getProxyAgentByAreaCode(proxyInfo);


const replaceUrlFromJs = await getReplaceUrl(nextUrl, proxy,heard);
console.log(replaceUrlFromJs);