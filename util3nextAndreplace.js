import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from 'axios'
import * as cheerio from 'cheerio';
import { URL } from 'url';



export function getProxyAgentByAreaCode( proxyInfo) {
  const defaultProxy = {
    username: '176210116482s_area-US',
    password: 'chuyi1122',
    host: 'proxy.smartproxycn.com',
    port: '1000',
    // username: 'uPc6yO0KYBKFK7Ba',
    // password: 'K2EMHhDpaaFVryse_country-us',
    // host: 'geo.iproyal.com',
    // port: '12321'
  };

  const selectedProxy = proxyInfo || defaultProxy;
  const { username, password, host, port } = selectedProxy;
  console.log(`当前IP ：http://${username}:${password}@${host}:${port}`)

  return new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);
}

async function getAgentPublicIp (agent) {
  let proxyIp = '';
  let location = '';
  try {
    const response = await axios.get('https://httpbin.org/ip', { 'httpsAgent': agent });
    console.log(response?.data);
    proxyIp = response?.data?.origin;
    if (proxyIp != undefined) {
      // 获取代理服务器IP的归属地信息
      const url = `http://opendata.baidu.com/api.php?query=${proxyIp}&resource_id=6006&oe=utf8`;
      const locationInfo = await axios.get(url, { timeout: 3000 });
      console.log(locationInfo?.data?.data[0]?.location);
      location = locationInfo?.data?.data[0]?.location;
    }
  } catch (error) {
    console.log('解析代理ip失败 ：' +　error)
  }
  return { proxyIp, location };
}


export async function   getDuomaiTargetUrl (shortUrl, proxyInfo) {
  // 解析URLhttps://app.partnermatic.com/track/b7f6y1oJTi8biVngnexde8_arqC2wSYJx3zmZ_b38_aUKool_bsD8ONK3ZSJ5LoswUp5bmNBQgkvgHu3?url=https%3A%2F%2Fwearnumi.com&uid=1221

  console.log('run DuomaiTargetUrl =================================================================================');

  const parsedUrl = new URL(shortUrl);
  var history = [shortUrl];

  let proxyAgent = getProxyAgentByAreaCode( proxyInfo);  //获取代理商转发地址
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent);   // 获取代理地址相关信息 IP  所属地区
  const response = await axios.get(shortUrl, { 'httpAgent': proxyAgent });
  // 使用cheerio来解析HTML
  const $ = cheerio.load(response.data);
  const scriptContent = $('script').text();
  // console.log('getDuomaiTargetUrl　scriptContent  :' +scriptContent);

  // const regex = /var u=(['"](.+?)['"])/;  //学安 旧
  const regex = /var\s+u\s*=\s*(['"])(https?.+?)\1/;
  const match = scriptContent.match(regex);
  console.log('getDuomaiTargetUrl match :' +match);

  if (match) {
    console.log('提取的u变量值为：', match[2]);
    const matchUrl = match[2] + parsedUrl?.hash
    console.log('matchUrl : ' + matchUrl)
    history.push(matchUrl);
    var nextUrl = matchUrl;
    try {
      for (let i = 0; i < 15; i++) {
        var tempUrl = '';
        try {
          tempUrl = await getNextLocation(nextUrl, proxyAgent);
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


export async function getBonusArriveRedirectUrl (shortUrl, proxyInfo,funType) {
  // 解析URL
  const parsedUrl = new URL(shortUrl);
  // if (parsedUrl.hostname == 'c.duomai.com' || parsedUrl.hostname == 'click.quk.com') {
  //   return await getDuomaiTargetUrl(shortUrl,  proxyInfo);
  // }

  if (funType =='fun1'){
      return await getDuomaiTargetUrl(shortUrl,  proxyInfo);

  }

  var history = [shortUrl];
  let proxyAgent = getProxyAgentByAreaCode( proxyInfo);
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent);
  try {
    var nextUrl = shortUrl;
    var lastParseUrl = '';
    for (let i = 0; i < 8; i++) {
      if (nextUrl == lastParseUrl) {
        break;
      }
      var tempUrl = '';
      try {
        tempUrl = await getNextLocation(nextUrl, proxyAgent);
        lastParseUrl = nextUrl;
      } catch (error) {
        console.log('find 3xx redirects exception')
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

async function getNextLocation (url, proxyAgent) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'manual', // 禁止自动重定向
    agent: proxyAgent
  });
  console.log('getNextLocation response.status: '+response.status + url)
  let nextUrl = url  //原为空
  // let nextUrl = ''  //原为空
  if (response.status >= 300 && response.status < 400) {
    // bonus自定义转跳
    nextUrl = response.headers.get('Location');
    console.log('response.status >= 300  : ' + nextUrl);
  }
  if (response.redirect) {
    // 重定向
    nextUrl = response.url;
    console.log('response.redirect  : ' + nextUrl);

  }
  // 没找到302 检查如果是200中带JS

  return nextUrl.replace(/\\\//g, '/');

}


const list_regex = [/window\.location\.replace\('([^']+)'\)/,
  /var\s+u\s*=\s*(['"])(https?.+?)\1/,
  /location\.replace\('([^']+)'\)/,
  /var\s+u\s*=\s*['"]([^'"]+)['"]/,
  /var link = "(.*?)";/];
export async function getReplaceUrl (url, proxyAgent) {
  const response = await axios.get(url, { 'httpAgent': proxyAgent, timeout: 5000 });
  // 使用cheerio来解析HTML
  const $ = cheerio.load(response.data);
  const parsedUrl = new URL(url);
  // 使用Promise.all来处理所有的script标签
  const promises = $('script').map((_, script) => {
    // 获取script标签的内容
    const scriptContent = $(script).html();
    console.log('scriptContent:', scriptContent)
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
