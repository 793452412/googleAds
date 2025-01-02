import {bulidHeards,getAgentPublicIp} from "../util3nextAndreplace_OLD.js";
import { getProxyAgentByAreaCode} from "../util3nextAndreplace_OLD.js";
import axios from 'axios'

import fetch from "node-fetch";


async function getRequestInfo(agent,headers) {


    var response = await fetch('https://httpbin.org/anything', {
        method: 'GET',
        redirect: 'manual', // 禁止自动重定向
        agent: agent,
        headers: headers
    });
    response = await response.json();
    // const response = await axios.get('https://httpbin.org/anything', {
    //     headers: headers,
    //     httpsAgent: agent,  // 使用代理发送请求
    //     httpAgent: agent,  // 使用代理发送请求
    // });
    // const response  = await getByAxions('https://httpbin.org/anything',agent,headers)
    // 输出请求头和代理IP
    console.log("response :"　,response);
    console.log('Request Headers:', response.headers);  // 请求头   如果使用fetch 则去掉data
    console.log('Request URL:', response.url);  // 请求的 URL（带代理后）
    console.log('Your IP address (Proxy IP):', response.origin);  // 代理 IP 地址
}

const heard = await bulidHeards("www.baidu.com") //不设置则为空
// const heard = await bulidHeards() //不设置则为空
console.log(heard);
console.log("heard===", heard);

const proxyInfo = {
    "username": "uPc6yO0KYBKFK7Ba",
    "password": "K2EMHhDpaaFVryse_country-us",
    "host": "geo.iproyal.com",
    "port": "12321"
}
console.log("=================================================================================================");

const proxy = await getProxyAgentByAreaCode( proxyInfo);
const df = await getAgentPublicIp( proxy,heard);
console.log(df)
