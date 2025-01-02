import { HttpsProxyAgent  } from 'https-proxy-agent'
import { HttpProxyAgent  } from 'http-proxy-agent'
import fetch from 'node-fetch'
import axios from 'axios'
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { faker } from '@faker-js/faker';
import {getDataByRe} from "./getRe/getDataByRe.js";


export async function  getRedirectHeaders(url,agent,heard) {
  console.log('运行了getRedirectHeaders ')
  const response = await axios.get(url, {
    // maxRedirects: 0, // 防止 Axios 自动跟随重定向
    httpsAgent: agent,
    httpAgent: agent,
    headers: heard,
    // timeout:5000
  });
  const reHeard = response.headers;
  const redict = {};
  // console.log("返回的头部信息 ： ",reHeard);
  var heard_list = ['location','refresh'];
  for (const key of heard_list) {
    if (reHeard.hasOwnProperty(key)) {
      redict[key] = reHeard[key];
      console.log(redict);
      console.log(`找到头部信息: ${key}, Value: ${reHeard[key]}`);

    } else {
      console.log(`未找到头部信息: ${key}`);
    }
  }

  return redict;

}


export async function  checkYeahHeardLoca(url,agent,heard,){
  const res_heard = await getRedirectHeaders(url,agent,heard);  // 获取res heard
  const redictUrl = await getDataByRe(JSON.stringify(res_heard),/url=(https?:\/\/[^\s"}]+)/) // 获取重定向链接
  return redictUrl;
}

// 生成伪造的 Accept 请求头
function generateFakeAccept() {
  const acceptTypes = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',  // 浏览器请求
    'application/json, text/javascript, */*; q=0.01',  // JSON 请求（API）
    'image/webp,*/*;q=0.8',  // 支持 WebP 图像格式
    '*/*',  // 支持所有类型的内容
    'text/plain, */*; q=0.01'  // 纯文本请求
  ];

  // 随机选择一个 Accept 类型
  return acceptTypes[Math.floor(Math.random() * acceptTypes.length)];
}

// 生成伪造的 User-Agent
function generateFakeUserAgent() {
  return faker.internet.userAgent();  // 使用 faker 生成随机的 User-Agent
}

// 生成伪造的 Cookies
function generateFakeCookies() {
  const cookieName = faker.lorem.word();  // 随机生成 Cookie 名称
  const cookieValue = faker.lorem.word(); // 随机生成 Cookie 值
  const domain = faker.internet.domainName();  // 随机生成域名
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);  // 设置 Cookie 过期时间为 1 年

  // 构建 Cookie 字符串
  const cookie = `${cookieName}=${cookieValue}; Domain=${domain}; Expires=${expirationDate.toUTCString()}; Path=/; Secure; HttpOnly`;
  return cookie;
}

//生成伪造的Accept-Encoding
function generateFakeAcceptEncoding() {
  const encodingTypes = [
    'gzip, deflate, br',  // 支持 gzip、deflate 和 Brotli 编码
    'gzip, deflate',      // 支持 gzip 和 deflate 编码
    'br',                 // 仅支持 Brotli 编码
    'identity',           // 不进行压缩
    '*',                  // 允许所有编码方式
  ];

  // 随机选择一个 Accept-Encoding 类型
  return encodingTypes[Math.floor(Math.random() * encodingTypes.length)];
}


// 代理信息构造/**/
export  function getProxyAgentByAreaCode( proxyInfo) {
  const defaultProxy = {
    // username: '176210116482s_area-US',
    // password: 'chuyi1122',
    // host: 'proxy.smartproxycn.com',
    // port: '1000',
    // username: 'uPc6yO0KYBKFK7Ba',
    // password: 'K2EMHhDpaaFVryse_country-us',
    // host: 'geo.iproyal.com',
    // port: '12321',
    username: 'coment73028-res-ROW',
    password: 'Bok0ObLI0889m6pTT7X9',
    host: 'proxy.iprocket.io',
    port: '5959'
  };
  const selectedProxy = proxyInfo || defaultProxy;
  // console.log("selectedProxy  : " + JSON.stringify(selectedProxy));
  const { username, password, host, port } = selectedProxy;
  // console.log(`当前IP ：http://${username}:${password}@${host}:${port}`)
  const proxyUrl = `http://${username}:${password}@${host}:${port}`;
  return new HttpsProxyAgent(proxyUrl)
}
//获取代理IP 地址
export async function getAgentPublicIp (agent,headers) {
  let proxyIp = '';
  let location = '';
  try {
    const response = await axios.get('https://httpbin.org/ip', {
      httpsAgent: agent,
      httpAgent: agent,
      headers: headers
    });
    // console.log(response?.data);
    proxyIp = response?.data?.origin;
    console.log("proxyIp : " ,proxyIp);
    if (proxyIp != undefined) {
      // 获取代理服务器IP的归属地信息
      const url = `http://opendata.baidu.com/api.php?query=${proxyIp}&resource_id=6006&oe=utf8`;
      const locationInfo = await axios.get(url, { timeout: 3000 });
      // console.log(locationInfo?.data?.data[0]?.location);
      location = locationInfo?.data?.data[0]?.location;
    }
  } catch (error) {
    console.log('解析代理ip失败getAgentPublicIp ：' +　error)
  }
  return { proxyIp, location };
}

//构建请求头
export async function bulidHeards(refererUrl=undefined) {
  let headers = ''; // 全局定义 headers 变量

  try {
    const userAgent = generateFakeUserAgent();
    const cookies = generateFakeCookies();
    const accept = generateFakeAccept();
    const acceptEncoding = generateFakeAcceptEncoding();
    if (refererUrl==undefined || refererUrl==null) {
      headers = {
        'User-Agent': userAgent,  // 设置伪造的 User-Agent
        'Cookie': cookies,        // 设置伪造的 Cookies
        'Accept': accept,
        'Accept-Encoding': acceptEncoding,
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      };
      console.log("headers 获取成功不带 Referer");

    }else {
      headers = {
        'Referer': refererUrl,
        'User-Agent': userAgent,  // 设置伪造的 User-Agent
        'Cookie': cookies,        // 设置伪造的 Cookies
        'Accept': accept,
        'Accept-Encoding': acceptEncoding,
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      };
      console.log("headers 获取成功带 Referer");


    }
    // 使用声明的 headers 变量

    // return headers;  // 返回 headers 对象
  } catch (error) {
    console.log(error);
    // return headers;  // 出现错误时，返回空的 headers
  }
  // console.log("headers:＝＝＝＝＝＝"+headers);
  return headers;
}


//fun1
export async function   getDuomaiTargetUrl (shortUrl,proxyAgent,refererUrl) {
  // 解析URLhttps://app.partnermatic.com/track/b7f6y1oJTi8biVngnexde8_arqC2wSYJx3zmZ_b38_aUKool_bsD8ONK3ZSJ5LoswUp5bmNBQgkvgHu3?url=https%3A%2F%2Fwearnumi.com&uid=1221

  console.log('run DuomaiTargetUrl =================================================================================');
  console.log('所需解析的短链是 ：  ======================' +shortUrl);

  const parsedUrl = new URL(shortUrl);
  var history = [shortUrl];

  const heard = await bulidHeards(refererUrl);
  if (typeof heard !== 'object') {
    console.error('Received invalid headers:', heard);
    return;
  }

  // let proxyAgent = getProxyAgentByAreaCode( proxyInfo);  //获取代理商转发地址
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent,heard);   // 获取代理地址相关信息 IP  所属地区

  console.log("获取代理地址成功");
  const response = await axios.get(shortUrl, {
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
    headers: heard
  });
  // 使用cheerio来解析HTML
  const $ = cheerio.load(response.data);
  const scriptContent = $('script').text();
  // console.log('getDuomaiTargetUrl　scriptContent  :' +scriptContent);

  // const regex = /var u=(['"](.+?)['"])/;
  const regex = /var\s+u\s*=\s*(['"])(https?.+?)\1/;
  const match = scriptContent.match(regex);
  // console.log('getDuomaiTargetUrl match :' +match);

  if (match) {
    console.log('提取的u变量值为：', match[2]);
    const matchUrl = match[2] + parsedUrl?.hash
    console.log('matchUrl : ' + matchUrl)
    history.push(matchUrl);
    var nextUrl = matchUrl;
    try {
      for (let i = 0; i < 10; i++) {
        var tempUrl = '';
        try {
          tempUrl = await getNextLocation(nextUrl, proxyAgent,heard);
          console.log('tempUrl : ' + i +tempUrl);
        } catch (error) {
          // 异常中断
          console.log('getNextLocation报错 : ' + error);
          break;
        }
        // 找不到下一个重定向头部地址，终端
        if (tempUrl == null || tempUrl.length <= 0) {
          break;
        }
        console.log('重定向：', i, tempUrl);
        nextUrl = tempUrl;
        history.push(tempUrl);

        // 检查 js replace
        const replaceUrlFromJs = await getReplaceUrl(nextUrl, proxyAgent);
        if (replaceUrlFromJs != null && replaceUrlFromJs != undefined) {
          nextUrl = replaceUrlFromJs;
          history.push(nextUrl);
        }
      }
    } catch (error) {
      console.log('解析url重定向失败 ： '+error)
    }
    return {
      'targetUrl': nextUrl,
      history,
      proxyIp,
      location
    }
  }
}

//fun2
export async function getBonusArriveRedirectUrl (shortUrl, proxyInfo,funType,refererUrl) {
  // 解析URL
  const parsedUrl = new URL(shortUrl);
  let proxyAgent = getProxyAgentByAreaCode( proxyInfo);


  if (funType =='fun1'){
      return await getDuomaiTargetUrl(shortUrl,  proxyAgent,refererUrl);
  }

  if(funType ==='fun3'){
    console.log("运行 getYeahPromosTargetUrl");
    return await getYeahPromosTargetUrl(shortUrl, proxyAgent,refererUrl);
  }

  console.log('run BonusArriveRedirectUrl =================================================================================');

  let heard = await bulidHeards(refererUrl);
  var history = [shortUrl];
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent,heard);
  try {
    var nextUrl = shortUrl;
    var lastParseUrl = '';
    for (let i = 0; i < 6; i++) {
      if (nextUrl == lastParseUrl) {
        break;
      }
      var tempUrl = '';
      try {
        tempUrl = await getNextLocation(nextUrl, proxyAgent,heard);
        lastParseUrl = nextUrl;
      } catch (error) {
        console.log('getNextLocation 报错 :',error)
      }
      // 找不到下一个重定向头部地址，终端
      if (tempUrl != null && tempUrl.length > 0) {
        console.log('重定向：', i, tempUrl);
        nextUrl = tempUrl;
        history.push(tempUrl);
      }

      // 检查 js replace
      try {
        const replaceUrlFromJs = await getReplaceUrl(nextUrl, proxyAgent);
        if (replaceUrlFromJs != null && replaceUrlFromJs != undefined) {
          lastParseUrl = nextUrl;
          nextUrl = replaceUrlFromJs;
          history.push(nextUrl);
        }
      } catch (error) {
        console.log('find js redirects exception')
        // break;
      }
    }

    if (nextUrl != shortUrl) {
      return {
        'targetUrl': nextUrl,
        history,
        proxyIp,
        location
      };
    }
    console.log('fail parse url:' + shortUrl)
    return {
      "targetUrl": '',
      history,
      proxyIp,
      location
    };
  } catch (error) {
    // 错误处理
    console.error(error);
  }
  return null;
}

//fun3
export async function getYeahPromosTargetUrl (shortUrl,proxyAgent,refererUrl) {
  console.log("getYeahPromosTargetUrl :  运行了")
  const heard = await bulidHeards(refererUrl);
  console.log("heard : ",heard)
  if (typeof heard !== 'object') {
    console.error('Received invalid headers:', heard);
    return;
  }
  // console.log(`shortUrl: ${refererUrl}`);
  // console.log(`agent: ${proxyAgent}`);
  // console.log(`refererUrl: ${refererUrl}`);
  // console.log(`+++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent,heard);   // 获取代理地址相关信息 IP  所属地区
  //从请求头获取重定向链接
  const direct = await checkYeahHeardLoca(shortUrl,proxyAgent,heard)
  console.log("direct : "+direct)

  // var currentUrl=direct;  //当前url
  // var nextUrl = '';   //下一个url
  var history = [shortUrl]
  if (direct) {
    history.push(direct);
  }
  for (let i = 0; i < 4; i++) {
    const nextURL = history[history.length - 1];
    let attempts = 0;
    let maxRetries = 3;
    var getnextUrl = nextURL

    console.log(`history[-1] : ${nextURL}`);

    try{

      console.log(" getnextUrl : ========" ,i)
      getnextUrl = await getNextLocation(nextURL, proxyAgent,heard);

      if (getnextUrl !== null && getnextUrl !== undefined && getnextUrl !== history[history.length - 1]) {


        history.push(getnextUrl);
        continue
      }
    }catch (err){

      console.log("报错了  " ,err);
    }

    console.log(`使用getNextLocationgetNextLocationgetNextLocationgetNextLocationgetNextLocationgetNextLocation`);

    try{
      // while (attempts < maxRetries) {   //页面寻找 对应重定向URL 可能会有代理网络延迟的情况，循环三次，找到就打断
        console.log(`使用getReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrlgetReplaceUrl`);
        console.log(" getReplaceUrl : ========" ,i)

      const  getUrl = await getReplaceUrl(nextURL,proxyAgent,heard);
        if (getUrl !== null && getUrl !== undefined) {
          history.push(getUrl);
          // break;
        }
        attempts++;
      // }
    }catch(err){
      history.push(nextURL);
      // histroyUrlList.push(nextURL);
    }

  }

  // const direct_dict = {}
  return {
    // 'targetUrl':histroyUrlList[histroyUrlList.length - 1],
    targetUrl:getnextUrl,
    history,
    proxyIp,
    location
  }

}



async function getNextLocation (url, proxyAgent,heard) {

  console.log('url : ' + url);
  // console.log('proxyAgent : ' + proxyAgent);
  // console.log('proxyAgent : ' + heard);
  var nextUrl =url
  try{
      const response = await axios.get(url, {
      httpsAgent: proxyAgent,
      httpAgent: proxyAgent,
      headers: heard,
      maxRedirects  : 0
    })
    // console.log("999999999999999999999999999999999999999999");
    // console.log(response);
    // console.log("999999999999999999999999999999999999999999");
  }catch (error) {
    if (error.response && error.response.status >= 300 && error.response.status < 400) {
      // 获取重定向的目标 URL
      // console.log("999999999999999999999999999999999999999999");
      // console.log(error.response);
      // console.log("999999999999999999999999999999999999999999");
      nextUrl = error.response.headers['location'];
      console.log('getNextLocation Redirect URL:', nextUrl);

    } else {
      nextUrl = url
      console.error('getNextLocation Request failed:', error.message);
    }


}
  return nextUrl.replace(/\\\//g, '/');

}

const list_regex =
    [/window\.location\.replace\('([^']+)'\)/,
  /var\s+u\s*=\s*(['"])(https?.+?)\1/,
  /location\.replace\('([^']+)'\)/,
  /var\s+u\s*=\s*['"]([^'"]+)['"]/,
  /var link = "(.*?)";/,
      /window\.location\.assign\s*\(\s*['"]([^'"]+)['"]\s*\)/,
      /window\.location\.replace\(["']([^"']+)["']\)/
    ];
export async function getReplaceUrl (url, proxyAgent,heard) {
  const response = await axios.get(url, {
    'httpAgent': proxyAgent,
    'httpsAgent': proxyAgent,
    headers: heard,
     });
  // 使用cheerio来解析HTML
  const $ = cheerio.load(response.data);
  const parsedUrl = new URL(url);
  // 使用Promise.all来处理所有的script标签
  const promises = $('script').map((_, script) => {
    // 获取script标签的内容
    const scriptContent = $(script).html();
    let match_url = '';
    list_regex.forEach((regex, index) => {
      const match = scriptContent.match(regex);
      if (match) {
        match_url = match[1];
        console.log(`正则匹配: ${regex}, 提取: ${match_url}`);
        return;
      }
    })
    return match_url + parsedUrl?.hash;
  }).get(); // 将map转换为实际的数组

  // 等待所有promises解决
  const results = await Promise.all(promises);

  // 找到第一个非null的结果
  const redirectUrl = results.find(result => result.length > 0);

  if (redirectUrl) {
    return redirectUrl;
  }

  return null;
}
