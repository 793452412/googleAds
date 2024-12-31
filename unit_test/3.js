import * as cheerio from "cheerio";
import axios from 'axios'
import puppeteer from "puppeteer";
import {getProxyIpUrl} from "../util3nextAndreplace.js";

async function getRedirectUrl(url, proxyInfo) {
    const { username, password, host, port, protocol } = proxyInfo;

    let browser;
    try {
        // 构建代理字符串
        const proxyString=`${protocol}://${username}:${password}@${host}:${port}`;
        console.log("proxyString: ", proxyString);

        // 启动浏览器并设置代理
        browser = await puppeteer.launch({
            headless: false, // 设置为 false 以便观察浏览器行为
            args: [
                // `--proxy-server=${proxyString}`,
                `--proxy-server=${protocol}://${username}:${password}@${host}:${port}`,
                '--ignore-certificate-errors'
            ],
        });

        const page = await browser.newPage();

        // 设置请求头
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        });

        // 导航到目标 URL 并等待网络空闲
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 等待页面重定向完成
        await page.waitForFunction(
            () => window.location.href !== arguments[0],
            {}, // options
            url // argument passed to the function in the browser context
        );

        // 获取重定向后的 URL
        const redirectedUrl = page.url();
        console.log('Redirected URL:', redirectedUrl);
        return redirectedUrl;
    } catch (error) {
        console.error('Error getting redirected URL:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
// 示例调用
(async () => {
    const url = 'https://yeahpromos.com/index/index/openurl?track=8545d380cc57fa27&url=';
    const proxyInfo = {
        "username": "huashao988-zone-custom-region-us",
        "password": "huashao988",
        "host": "91b6c411c42db002.arq.na.ipidea.online",
        "port": "2333",
        "protocol":"http"
    };

    try {
        const redirectedUrl = await getRedirectUrl(url, proxyInfo);
        if (redirectedUrl) {
            console.log('Final Redirected URL:', redirectedUrl);
        }
    } catch (error) {
        console.error('Main script error:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
})();