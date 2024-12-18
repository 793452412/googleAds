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
  try {
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
        var i = 6;
        while (i > 0) {
          var tempUrl = await getNextLocation(nextUrl, proxyAgent);
          if (tempUrl == null || tempUrl.length <= 0) {
            break;
          }
          nextUrl = tempUrl;
          history.push(tempUrl);
          i--;
        }
      } catch (error) {
        console.log('解析url重定向失败', error.error)
      }
      return {
        'targetUrl': nextUrl,
        history,
        proxyIp,
        location
      }
    }
    console.log('没有找到解析失败');
  } catch (error) {
    console.error(error);
  }
  return {}
}

export async function getBonusArriveRedirectUrl (shortUrl, areaCode, proxyInfo) {
  var history = [shortUrl];
  let proxyAgent = getProxyAgentByAreaCode(areaCode, proxyInfo);
  let { proxyIp, location } = await getAgentPublicIp(proxyAgent);
  try {
    var i = 6;
    var nextUrl = shortUrl;
    while (i > 0) {
      var tempUrl = await getNextLocation(nextUrl, proxyAgent);
      if (tempUrl == null || tempUrl.length <= 0) {
        break;
      }
      nextUrl = tempUrl;
      history.push(tempUrl);
      i--;
    }
    if (nextUrl != shortUrl) {
      return {
        'targetUrl': nextUrl,
        history,
        proxyIp,
        location
      };
    }
    console.log('fail parse url.' + shortUrl)
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
