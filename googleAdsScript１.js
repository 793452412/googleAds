var failCount = 0;  // 记录连续失败次数

function getUrlFromApi(url, proxyInfo,funType) {
  var apiUrl = "http://198.11.177.211:3000/api/getTargetUrl"; // API接口地址

  // 构造请求体
  var payload = {
    "url": url,
    "proxyInfo": proxyInfo,
    "funType":funType
  };

  // 配置请求头和请求体
  var options = {
    'method': 'post', // 使用 POST 请求
    'contentType': 'application/json', // 设置请求类型
    'payload': JSON.stringify(payload), // 请求体
    'muteHttpExceptions': true, // 忽略HTTP错误，方便调试
  };

  try {
    // 发送请求到接口
    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseJson = JSON.parse(response.getContentText());

    // 获取接口返回的 URL 和 history 列表
    if (responseJson.status !== 'success') {
      Logger.log('API response error: ' + responseJson.message);
      return null; // 如果接口返回失败状态，直接返回 null
    }

    var targetUrl = responseJson.data.targetUrl; // 获取 targetUrl 字段
    var history = responseJson.data.history; // 获取 history 列表
    var url = responseJson.data.url; // 获取原始 URL
    return { targetUrl: targetUrl, history: history, url: url };
  } catch (e) {
    Logger.log('Error fetching URL from API: ' + e.toString());
    return null;
  }
}

function main() {
  // 配置您的代理信息
  var proxyInfo = {
    "username": "uPc6yO0KYBKFK7Ba",
    "password": "K2EMHhDpaaFVryse_country-us",
    "host": "geo.iproyal.com",
    "port": "12321"
  };
  var funType = "fun1";
  // 配置您的 URL，可以通过 history 列表选择或使用 url 或 targetUrl 字段
  var defaultUrl = "https://www.bonusarrive.com/link?ad=138681&c=1346&f=0"; // 默认URL
  var useHistory = false;  // 设置为 true 使用 history 列表，false 使用 targetUrl 或 url

  // 设置要使用的 history 索引（如果 useHistory 为 true）
  var historyIndex = 0;  // 默认使用 history 列表中的第一个 URL

  // 循环执行，每分钟一次，最多连续失败 3 次
  while (true) {
    Logger.log("Script execution started at: " + new Date());

    // 从接口获取目标 URL 和 history 列表
    var apiResponse = getUrlFromApi(defaultUrl, proxyInfo,funType);

    if (apiResponse) {
      var targetUrl = apiResponse.targetUrl;  // 获取 targetUrl
      var history = apiResponse.history;  // 获取 history 列表
      var url = apiResponse.url;  // 获取原始 URL

      // 根据 useHistory 常量选择 URL
      var selectedUrl;
      if (useHistory && history && history.length > 0) {
        selectedUrl = history[historyIndex];  // 使用 history 列表中的 URL
      } else {
        selectedUrl = targetUrl || url || defaultUrl;  // 使用 targetUrl 或 url，若无则使用默认 URL
      }

      Logger.log("Selected URL for processing: " + selectedUrl);

      // 获取广告系列
      const campaignName = "FL LSKD";  // 广告系列名称
      const campaignIterator = AdsApp.campaigns()
          .withCondition(`campaign.name = "${campaignName}"`)
          .get();

      if (campaignIterator.hasNext()) {
        const campaign = campaignIterator.next();
        const urls = campaign.urls();

        // 获取并打印当前跟踪模板
        const currentTrackingTemplate = urls.getTrackingTemplate();
        Logger.log("Current tracking old template: " + currentTrackingTemplate);

        // 分离最终URL的基础部分和查询参数部分
        const urlParts = selectedUrl.split('?');
        const queryParams = urlParts.length > 1 ? '?' + urlParts[1] : '';

        // 构建新的跟踪模板
        const cd_url = `{lpurl}${queryParams}`;

        // 检查是否跟踪模板需要更新
        if (cd_url !== currentTrackingTemplate) {
          Logger.log("Constructed new tracking template: " + cd_url);
          urls.setTrackingTemplate(cd_url); // 更新跟踪模板
          Logger.log("Updated tracking template for campaign: " + campaign.getName());
          failCount = 0;  // 成功更新，重置失败计数
        } else {
          Logger.log("No change in tracking template, skipping update.");
        }
      } else {
        Logger.log("Campaign with name '" + campaignName + "' not found.");
      }
    } else {
      Logger.log("Failed to get the final URL from API.");
      failCount++;  // 增加失败计数
    }

    // 检查是否已经连续失败 3 次
    if (failCount >= 3) {
      Logger.log("Script has failed 3 times consecutively. Stopping the script.");
      break;  // 停止脚本
    }

    // 每次循环后等待 1 分钟
    Logger.log("Sleeping for 1 minute before next update...");
    //Utilities.sleep(60 * 1000); // 60秒 = 1分钟
    break;
  }
}
