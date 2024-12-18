const cheerio = require('cheerio');

const { getReplaceUrl } = require('./util');
const { urlencoded } = require('express');


url = 'https://www.shareasale-analytics.com/r.cfm?u=1012116&b=1877024&m=117336&afftrack=604186848&urllink=https%3A%2F%2Fwearnumi.com%2F&shrsl_analytics_sscid=c1k8%5Ftb2yw&shrsl_analytics_sstid=c1k8%5Ftb2yw';
res = getReplaceUrl(url)
console.log(res)
console.log(decodeURIComponent(res))