
const express = require('express');
const bodyParser = require('body-parser');
const { URL } = require('url');
const app = express();
const port = 3000;
const { getBonusArriveRedirectUrl } = require('./util3nextAndreplace.js')

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
  const { url, areaCode, proxyInfo ,funType} = req.body;
  try {
    const { targetUrl, history, proxyIp, location } = await getBonusArriveRedirectUrl(url, proxyInfo,funType);
    const result = buildResult(url, targetUrl, history, proxyIp, location, areaCode);
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

function buildResult (url, targetUrl, history, proxyIp, location, areaCode) {
  if (targetUrl != null && targetUrl.length > 0) {
    return {
      status: 'success',
      message: '请求处理成功',
      data: {
        url,
        areaCode,
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
      areaCode: areaCode,
      targetUrl,
      history,
      proxyIp,
      location
    }
  }
}

