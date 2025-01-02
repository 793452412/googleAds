
const express = require('express');
const bodyParser = require('body-parser');
const { URL } = require('url');
const app = express();
const port = 3001;
// const { getBonusArriveRedirectUrl } = require('./util3nextAndreplace.js')
const { getBonusArriveRedirectUrl } = require('./util3nextAndreplace_OLD.js')


// 使用body-parser中间件解析JSON请求体
app.use(bodyParser.json());
app.use(require('express-status-monitor')());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/api/getTargetUrl', async (req, res) => {
  // 从请求体中获取url和cityCode参数
  const { url, proxyInfo ,funType,refererUrl} = req.body;

  try {

    // const proxyInfo = {
    //   username: 'uPc6yO0KYBKFK7Ba',
    //   password: 'K2EMHhDpaaFVryse_country-us',
    //   host: 'geo.iproyal.com',
    //   port: '12321',
    // }
    // const url = "https://trac.fanstoshop.com/track.php?ref=1065288&aid=35594&euid=%7B%7BDATETIME%7D%7D&t=https%3A%2F%2Fwww.anntaylor.com"
    // const funType = "fun2"
    // const refererUrl = "www.baidu.com"


    const { targetUrl, history, proxyIp, location } = await getBonusArriveRedirectUrl(url, proxyInfo,funType,refererUrl);
    console.log(` history  66:  ${history}`);
    const result = buildResult(url, targetUrl, history, proxyIp, location);
    res.json(result);

  } catch (error) {
    // 错误处理
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: '服务处理失败',
      error: error.message
    });
  }
});

function buildResult (url, targetUrl, history, proxyIp, location) {
  if (targetUrl != null && targetUrl.length > 0) {
    return {
      status: 'success',
      message: '请求处理成功',
      data: {
        url,
        targetUrl,
        history,
        proxyIp,
        location
      }
    }
  }
  return {
    status: 'fail',
    message: '请求处理失败',
    data: {
      url,
      targetUrl,
      history,
      proxyIp,
      location
    }
  }
}

