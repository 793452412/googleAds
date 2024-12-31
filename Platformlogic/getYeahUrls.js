import {URL} from "url";
import {
    bulidHeards, checkYeahHeardLoca,
    getAgentPublicIp,
    getByAxions, getNextLocation,
    getProxyAgentByAreaCode,
    getRedirectHeaders, getReplaceUrl
} from "../util3nextAndreplace.js";
import {tr} from "@faker-js/faker";



export async function getYeahPromosTargetUrl (shortUrl,agent,refererUrl) {

    const heard = await bulidHeards(refererUrl);
    if (typeof heard !== 'object') {
        console.error('Received invalid headers:', heard);
        return;
    }

    let proxyAgent = getProxyAgentByAreaCode( agent);  //获取代理商转发地址
    let { proxyIp, location } = await getAgentPublicIp(proxyAgent,heard);   // 获取代理地址相关信息 IP  所属地区
    //从请求头获取重定向链接
    const direct = await checkYeahHeardLoca(shortUrl,proxyAgent,heard)
    console.log("direct : "+direct)

    // var currentUrl=direct;  //当前url
    // var nextUrl = '';   //下一个url
    var histroyUrlList = [shortUrl]
    if (direct) {
        histroyUrlList.push(direct);
    }
    for (let i = 0; i < 4; i++) {
        const nextURL = histroyUrlList[histroyUrlList.length - 1];
        let attempts = 0;
        let maxRetries = 3;
        var getnextUrl = nextURL

        console.log(`histroyUrlList[-1] : ${nextURL}`);

        try{
               getnextUrl = await getNextLocation(nextURL, agent,heard);

                if (getnextUrl !== null && getnextUrl !== undefined && getnextUrl !== histroyUrlList[histroyUrlList.length - 1]) {

                    histroyUrlList.push(getnextUrl);
                    continue
                }
        }catch (err){

            console.log("报错了  ");
        }

        console.log(`使用getNextLocationgetNextLocationgetNextLocationgetNextLocationgetNextLocationgetNextLocation`);

        try{
            while (attempts < maxRetries) {   //页面寻找 对应重定向URL 可能会有代理网络延迟的情况，循环三次，找到就打断
                console.log(`使用getReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrl`);

                const  getUrl = await getReplaceUrl(nextURL,proxyAgent,heard);
                if (getUrl !== null && getUrl !== undefined) {
                    histroyUrlList.push(getUrl);
                    break;
                }
                attempts++;
            }
        }catch(err){
            histroyUrlList.push(nextURL);
        }

    }

    // const direct_dict = {}
    return {
        // 'targetUrl':histroyUrlList[histroyUrlList.length - 1],
        targetUrl:getnextUrl,
        histroyUrlList,
        proxyIp,
        location
    }

}





// =======================================================================
// const proxyInfo = {
//     username: 'uPc6yO0KYBKFK7Ba',
//     password: 'K2EMHhDpaaFVryse_country-us',
//     host: 'geo.iproyal.com',
//     port: '12321',
// };
// // const shortUrl = 'https://yeahpromos.com/index/index/openurl?track=e079889dc45c70e0&url='
// const shortUrl = 'https://yeahpromos.com/index/index/openurl?track=1461c670e154565c&url='
// let  c = await getYeahPromosTargetUrl(shortUrl,proxyInfo);
// console.log("c  ",c);