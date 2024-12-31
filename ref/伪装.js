const axios = require('axios');
const cheerio = require('cheerio');

// 伪装的 Referer 和 User-Agent
const refererUrl = 'https://example.com';  // 你希望伪装成从此页面访问
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// 假设你有以下代理方法（自己定义或引入）

// 示例：调用函数
const shortUrl = 'https://lb.b9t.cc/1I1S';  // 输入短链
const proxyInfo = {
    "username": "uPc6yO0KYBKFK7Ba",
    "password": "K2EMHhDpaaFVryse_country-us",
    "host": "geo.iproyal.com",
    "port": "12321"
};

getDuomaiTargetUrl(shortUrl, proxyInfo).then((result) => {
    console.log('最终目标 URL:', result.targetUrl);
}).catch((error) => {
    console.log('处理失败:', error);
});
