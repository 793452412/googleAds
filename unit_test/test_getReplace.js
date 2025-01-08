import {bulidHeards, getProxyAgentByAreaCode, getReplaceUrl} from "../util3nextAndreplace.js";


const proxyInfo = {
    username: 'uPc6yO0KYBKFK7Ba',
    password: 'K2EMHhDpaaFVryse_country-us',
    host: 'geo.iproyal.com',
    port: '12321',
}
const heard = await bulidHeards("www.baidu.com") //不设置则为空
// const heard = await bulidHeards() //不设置则为空

const nextUrl =' https://api.yadore.com/v2/d?market=us&placementId=YEAHe95d9488ad51e8f0&projectId=BvUlvaD9lar7&isCouponing=true&url=https://stockx.com'
const proxy = await getProxyAgentByAreaCode(proxyInfo);


const replaceUrlFromJs = await getReplaceUrl(nextUrl, proxy,heard);
console.log(replaceUrlFromJs);