//服务器解长链版本

var failCount = 0;  // 记录连续失败次数

function getUrlFromApi(url, proxyInfo) {
  var apiUrl = "http://198.11.177.211:3000/api/getTargetUrl"; // API接口地址

  // 构造请求体
  var payload = {
    "url": url,
    "proxyInfo": proxyInfo
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
    var targetUrl = responseJson.targetUrl; // 假设接口返回的 JSON 中有 targetUrl 字段
    var history = responseJson.history; // 假设接口返回的 JSON 中有 history 字段，包含一个 URL 列表

    return { targetUrl: targetUrl, history: history };
  } catch (e) {
    Logger.log('Error fetching URL from API: ' + e.toString());
    return null;
  }
}

function main() {
  // 配置您的代理信息
  var proxyInfo = {
    "username": "uPc6yO0KYBKFK7Ba",
    "passward": "K2EMHhDpaaFVryse_country-us",
    "host": "geo.iproyal.com",
    "port": "12321"
  };

  // 配置您的 URL，可以通过 history 列表选择或使用 tagurl 字段
  var tagurl = "https://www.bonusarrive.com/link?ad=56584&c=1174&f=0"; // 默认URL

  // 设置常量，决定是否使用 history 中的 URL 或 tagurl
  var useHistory = true;  // 设置为 true 使用 history 列表，false 使用 tagurl

  // 循环执行，每分钟一次，最多连续失败 3 次
  while (true) {
    Logger.log("Script execution started at: " + new Date());

    // 从接口获取目标 URL 和 history 列表
    var apiResponse = getUrlFromApi(tagurl, proxyInfo);

    if (apiResponse) {
      var targetUrl = apiResponse.targetUrl;  // 获取目标 URL
      var history = apiResponse.history;  // 获取历史 URL 列表

      // 根据 useHistory 常量选择URL
      var selectedUrl;
      if (useHistory && history && history.length > 0) {
        var selectedHistoryIndex = 0;  // 选择 history 中的第一个 URL，可以修改这个索引
        selectedUrl = history[selectedHistoryIndex];
      } else {
        selectedUrl = targetUrl || tagurl;
      }

      Logger.log("Selected URL for processing: " + selectedUrl);

      // 获取广告系列
      const campaignName = "FL Xiaomi ES";  // 广告系列名称
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
    Utilities.sleep(60 * 1000); // 60秒 = 1分钟
  }
}
