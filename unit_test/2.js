import * as cheerio from "cheerio";
import axios from 'axios'
import puppeteer from "puppeteer";
import {getProxyIpUrl} from "../util3nextAndreplace.js";





async function getRedirectUrl(url,proxyInfo) {

    const { username, password, host, port } = proxyInfo;

    const browser = await puppeteer.launch({
        args: [
            // `--proxy-server=http://${host}:${port}`,
            `--proxy-server=http://${username}:${password}@${host}:${port}`,
            '--ignore-certificate-errors'
        ],
    });

    const page = await browser.newPage();

    // 设置代理认证
    // await page.authenticate({
    //     username: `${username}`,
    //     password: `${password}`,
    // });

    // 设置请求头
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Your-Custom-User-Agent',
        'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.goto(url);

    await page.waitForFunction(
        `window.location.href !== ${url}`,
        { timeout: 10000 }
    );

    const redirectedUrl = page.url();
    console.log('Redirected URL:', redirectedUrl);

    await browser.close();
}

let url = "https://yeahpromos.com/index/index/openurl?track=8545d380cc57fa27&url="
const proxyInfo = {
    "username": "huashao988-zone-custom-region-us",
    "password": "huashao988",
    "host": "91b6c411c42db002.arq.na.ipidea.online",
    "port": "2333"
}


getRedirectUrl(url,proxyInfo);
