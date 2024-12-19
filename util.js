import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from 'axios'
import * as cheerio from 'cheerio';
import { URL } from 'url';

function getProxyAgentByAreaCode (areaCode, proxyInfo) {
  if (proxyInfo != null) {
    const { username, passward, host, port } = proxyInfo;
    if (areaCode == undefined || areaCode.length == 0) {
      return new HttpsProxyAgent(`http://${username}:${passward}@${host}:${port}`);
    }
    return new HttpsProxyAgent(`http://${username}:${passward}_` + areaCode + `@${host}:${port}`);
  }
  if (areaCode == undefined || areaCode.length == 0) {
    return new HttpsProxyAgent('http://uPc6yO0KYBKFK7Ba:K2EMHhDpaaFVryse@geo.iproyal.com:12321');
  }
  return new HttpsProxyAgent('http://uPc6yO0KYBKFK7Ba:K2EMHhDpaaFVryse_' + areaCode + '@geo.iproyal.com:12321');
}

async function getAgentPublicIp (agent) {
  let proxyIp = '';
  let location = '';
  try {
    const response = await axios.get('https://httpbin.org/ip', { 'httpsAgent': agent, timeout: 1000 });
    console.log(response?.data);
    proxyIp = response?.data?.origin;
    if (proxyIp != undefined) {
      // 获取代理服务器IP的归属地信息
      const url = `http://opendata.baidu.com/api.php?query=${proxyIp}&resource_id=6006&oe=utf8`;
      const locationInfo = await axios.get(url, { timeout: 1000 });
      console.log(locationInfo?.data?.data[0]?.location);
      location = locationInfo?.data?.data[0]?.location;
    }
  } catch (error) {
    console.log('解析代理ip失败')
  }
  return { proxyIp, location };
}

export async function getDuomaiTargetUrl (shortUrl, areaCode, proxyInfo) {
  // 解析URL
  const parsedUrl = new URL(shortUrl);
  var history = [shortUrl];
  let proxyAgent = getProxyAgentByAreaCode(areaCode, proxyInfo);
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent);
  const response = await axios.get(shortUrl, { 'httpAgent': proxyAgent });
  // 使用cheerio来解析HTML
  const $ = cheerio.load(response.data);
  const scriptContent = $('script').text();
  const regex = /var u=(['"](.+?)['"])/;
  const match = scriptContent.match(regex);

  if (match) {
    console.log('提取的u变量值为：', match[2]);
    const matchUrl = match[2] + parsedUrl?.hash
    history.push(matchUrl);
    var nextUrl = matchUrl;
    try {
      for (let i = 0; i < 8; i++) {
        var tempUrl = '';
        try {
          tempUrl = await getNextLocation(nextUrl, proxyAgent);
        } catch (error) {
          // 异常中断
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
      console.log('解析url重定向失败')
    }

    return {
      'targetUrl': nextUrl,
      history,
      proxyIp,
      location
    }
  }
}

export async function getBonusArriveRedirectUrl (shortUrl, areaCode, proxyInfo) {
  var history = [shortUrl];
  let proxyAgent = getProxyAgentByAreaCode(areaCode, proxyInfo);
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent);
  try {
    var nextUrl = shortUrl;
    for (let i = 0; i < 8; i++) {
      var tempUrl = '';
      try {
        tempUrl = await getNextLocation(nextUrl, proxyAgent);
      } catch (error) {
        // 异常中断
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
      try {
        const replaceUrlFromJs = await getReplaceUrl(nextUrl, proxyAgent);
        if (replaceUrlFromJs != null && replaceUrlFromJs != undefined) {
          nextUrl = replaceUrlFromJs;
          history.push(nextUrl);
        }
      } catch (error) {
        console.log('find js redirects exception')
        break;
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
  let nextUrl = ''
  if (response.status >= 300 && response.status < 400) {
    // bonus自定义转跳
    nextUrl = response.headers.get('Location');
  }
  if (response.redirect) {
    // 重定向
    nextUrl = response.url;
  }
  // 没找到302
  return nextUrl;
}

const list_regex = [/window\.location\.replace\('([^']+)'\)/, /var u=['"](.+?)['"]/];

export async function getReplaceUrl (url, proxyAgent) {
  const response = await axios.get(url, { 'httpAgent': proxyAgent });
  // 使用cheerio来解析HTML
  const $ = cheerio.load(response.data);

  // 使用Promise.all来处理所有的script标签
  const promises = $('script').map((_, script) => {
    // 获取script标签的内容
    const scriptContent = $(script).html();
    console.log('scriptContent1:', scriptContent)
    let match_url = '';
    list_regex.forEach(regex => {
      const match = scriptContent.match(regex);
      if (match) {
        match_url = match[1];
        console.log('replace model 2 hit.', regex, match_url);
        return;
      }
    })
    return match_url;
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
