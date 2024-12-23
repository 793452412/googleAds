const axios = require('axios');
const cheerio = require('cheerio');

async function getDuomaiTargetUrl(shortUrl, proxyInfo) {
  const history = [shortUrl];
  let nextUrl = shortUrl;

  // 获取代理信息
  const proxyAgent = getProxyAgentByAreaCode(proxyInfo); // 获取代理商转发地址
  const { proxyIp, location } = await getAgentPublicIp(proxyAgent); // 获取代理地址相关信息（IP，地区）

  try {
    // 请求 URL 并处理 HTTP 重定向
    let response = await axios.get(nextUrl, {
      proxy: {
        host: proxyInfo.host,
        port: proxyInfo.port,
        auth: {
          username: proxyInfo.username,
          password: proxyInfo.password
        }
      },
      maxRedirects: 10, // 最大重定向次数
      validateStatus: status => status < 400, // 忽略 HTTP 错误
    });

    // 解析页面内容
    const $ = cheerio.load(response.data);
    const scriptContent = $('script').text();
    console.log('Page script content:', scriptContent);

    // 从 JavaScript 中提取跳转 URL
    const redirectUrl = extractRedirectUrlFromScript(scriptContent);
    if (redirectUrl) {
      console.log("Extracted redirect URL: ", redirectUrl);
      history.push(redirectUrl);
      nextUrl = redirectUrl;

      // 重定向最多 8 次
      for (let i = 0; i < 8; i++) {
        response = await axios.get(nextUrl, {
          proxy: {
            host: proxyInfo.host,
            port: proxyInfo.port,
            auth: {
              username: proxyInfo.username,
              password: proxyInfo.password
            }
          },
          maxRedirects: 10,
          validateStatus: status => status < 400,
        });

        const locationHeader = response.headers['location']; // 检查 HTTP 重定向头
        if (locationHeader) {
          console.log(`Redirected (HTTP 3xx): ${locationHeader}`);
          nextUrl = locationHeader;
          history.push(nextUrl);
        } else {
          console.log("No more HTTP redirects. Final URL: ", nextUrl);
          break;
        }

        // 检查是否存在 JavaScript 中的替代 URL
        const replaceUrlFromJs = await getReplaceUrl(nextUrl);
        if (replaceUrlFromJs) {
          nextUrl = replaceUrlFromJs;
          history.push(nextUrl);
          console.log("Redirected by JS to: ", nextUrl);
        }
      }
    }

    return {
      targetUrl: nextUrl,
      history,
      proxyIp,
      location
    };
  } catch (error) {
    console.error('Error fetching target URL: ', error);
    return null;
  }
}

// 从 JavaScript 中提取重定向 URL
function extractRedirectUrlFromScript(scriptContent) {
  const regex = /window\.location\.href\s*=\s*['"]([^'"]+)['"]/;
  const match = scriptContent.match(regex);
  return match ? match[1] : null;
}

// 模拟页面中的替代 URL（如 location.replace）
async function getReplaceUrl(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const scriptContent = $('script').text();

    const regex = /location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/;
    const match = scriptContent.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting replace URL: ', error);
    return null;
  }
}

// 获取代理地址
function getProxyAgentByAreaCode(proxyInfo) {
  // 这里根据 proxyInfo 配置返回代理的代理服务
  return {
    host: proxyInfo.host,
    port: proxyInfo.port,
    auth: {
      username: proxyInfo.username,
      password: proxyInfo.password
    }
  };
}

// 获取代理信息
async function getAgentPublicIp(proxyAgent) {
  // 实现一个请求来获取代理的公共IP，或者从代理信息中提取
  return {
    proxyIp: proxyAgent.host,
    location: 'US'
  };
}

