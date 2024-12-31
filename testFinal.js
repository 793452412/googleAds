import puppeteer from "puppeteer";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getCurrentPageUrl(url) {
    const browser = await puppeteer.launch({
        // headless: false,
        headless: true,
        args: [
            '--no-sandbox',     // 禁用沙箱
            '--disable-setuid-sandbox',  // 解决某些 Linux 系统上的问题
            '--disable-gpu',    // 禁用 GPU 加速
            '--disable-software-rasterizer',  // 禁用软件光栅化
            '--disable-dev-shm-usage',  // 解决内存分配问题（尤其是 Docker 环境中）
            '--disable-setuid-sandbox',
            '-no-sandbox'
        ]
    });

    const page = await browser.newPage();
    const currentUrl = url;


    try {
        // 设置请求拦截，阻止不必要的请求
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'image' || request.resourceType() === 'media') {
                request.abort();  // 阻止加载图片和媒体文件
            } else {
                request.continue();  // 继续加载其他资源
            }
        });

        // 导航到目标页面，等待页面加载完成
        await page.goto(url, {
            waitUntil: 'networkidle0',  // 等待网络空闲（适合 JS 重定向）
            timeout: 60000  // 增加超时限制为60秒
        });

        // 等待页面稳定，避免与页面的框架交互
        await sleep(12000);
        // 获取当前页面的URL
        const currentUrl = page.url();
        console.log('Current Page URL:', currentUrl);
    } catch (error) {
        console.error('Error during URL redirection:', error);
    } finally {
        // 关闭浏览器

        await browser.close();
    }
    return currentUrl;

}

// 示例 URL
const url = 'https://lb.b9t.cc/1I1S';  // 你要检查的 URL
const url2 = getCurrentPageUrl(url);
console.log(url2);
