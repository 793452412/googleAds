import {bulidHeards,getAgentPublicIp} from "../util3nextAndreplace.js";
import { getProxyAgentByAreaCode,getByAxions} from "../util3nextAndreplace.js";
import axios from 'axios'

async function getRequestInfo(agent,headers) {
    try {

        // const response = await fetch(url, {
        //     method: 'GET',
        //     redirect: 'manual', // 禁止自动重定向
        //     agent: agent,
        //     headers: headers
        // });
        // const response = await axios.get('https://httpbin.org/anything', {
        //     headers: headers,
        //     httpsAgent: agent,  // 使用代理发送请求
        //     httpAgent: agent,  // 使用代理发送请求
        // });
        const response  = await getByAxions('https://httpbin.org/anything',agent,headers)
        // 输出请求头和代理IP
        console.log('Request Headers:', response.data.headers);  // 请求头
        console.log('Request URL:', response.data.url);  // 请求的 URL（带代理后）
        console.log('Your IP address (Proxy IP):', response.data.origin);  // 代理 IP 地址

    } catch (error) {
        console.error('Error during request:', error);
    }
}


const heard = await bulidHeards("www.baidu.com") //不设置则为空
// const heard = await bulidHeards() //不设置则为空
console.log(heard);
console.log("heard===", heard);

const proxyInfo = {
    username: 'uPc6yO0KYBKFK7Ba',
    password: 'K2EMHhDpaaFVryse_country-us',
    host: 'geo.iproyal.com',
    port: '12321',
}
console.log("=================================================================================================");

const proxy = await getProxyAgentByAreaCode( proxyInfo);
const df = await getRequestInfo( proxy,heard);
