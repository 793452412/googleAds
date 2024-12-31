var failCount = 0;  // 记录连续失败次数

function getUrlFromApi(url, proxyInfo,funType,refererUrl) {
  var apiUrl = "http://198.11.177.211:3000/api/getTargetUrl";

  // 构造请求体
  var payload = {
    "url": url,
    "proxyInfo": proxyInfo,
    "funType":funType,
    "refererUrl":refererUrl

  };

  // 配置请求头和请求体
  var options = {
    'method': 'post', //
    'contentType': 'application/json', //
    'payload': JSON.stringify(payload), //
    'muteHttpExceptions': true, //
  };

  try {
    // 发送请求到接口
    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseJson = JSON.parse(response.getContentText());

    // 获取接口返回的 URL 和 history 列表
    if (responseJson.status !== 'success') {
      Logger.log('API response error: ' + responseJson.message);
      return null; //
    }

    var targetUrl = responseJson.data.targetUrl; //
    var history = responseJson.data.history; //
    var url = responseJson.data.url; //
    return { targetUrl: targetUrl, history: history, url: url };
  } catch (e) {
    Logger.log('Error fetching URL from API: ' + e.toString());
    return null;
  }
}

function main() {
  // 配置您的代理信息
  var proxyInfo = {
    "username": " ",             //填写代理信息===============
    "password": " ",
    "host": " ",
    "port": " "
  };
  var funType = "fun1"; // 多麦 LKB PB fun1    BA：fun2   部分链接fun1不行的时候就用Fun2如果都不行则发聩
  // 配置您的 URL，可以通过 history 列表选择或使用 url 或 targetUrl 字段
  var defaultUrl = " "; // 短链接=======================
  var useHistory = false;  // 高阶用法 设置为 true 使用 history 列表，false 使用 targetUrl 或 url
  var refererUrl = null;    //高阶用法 增加溯源默认为null
  // 设置要使用的 history 索引（如果 useHistory 为 true）
  var historyIndex = 0;  // 默认使用 history 列表中的第一个 URL

  // 循环执行，每分钟一次，最多连续失败 3 次
  while (true) {
    Logger.log("Script execution started at: " + new Date());

    // 从接口获取目标 URL 和 history 列表
    var apiResponse = getUrlFromApi(defaultUrl, proxyInfo,funType,refererUrl);

    if (apiResponse) {
      var targetUrl = apiResponse.targetUrl;  // 获取 targetUrl
      var history = apiResponse.history;  // 获取 history 列表
      var url = apiResponse.url;  // 获取原始 URL

      // 根据 useHistory 常量选择 URL
      var selectedUrl;
      if (useHistory && history && history.length > 0) {
        selectedUrl = history[historyIndex];
      } else {
        selectedUrl = targetUrl || url || defaultUrl;
      }

      Logger.log("Selected URL for processing: " + selectedUrl);

      // 获取广告系列
      const campaignName = "  ";  // 广告系列名称==========================
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
          urls.setTrackingTemplate(cd_url);
          Logger.log("Updated tracking template for campaign: " + campaign.getName());
          failCount = 0;
        } else {
          Logger.log("No change in tracking template, skipping update.");
        }
      } else {
        Logger.log("Campaign with name '" + campaignName + "' not found.");
      }
    } else {
      Logger.log("Failed to get the final URL from API.");
      failCount++;
    }

    // 检查是否已经连续失败 3 次
    if (failCount >= 3) {
      Logger.log("Script has failed 3 times consecutively. Stopping the script.");
      break;
    }

    // 每次循环后等待 1 分钟
    Logger.log("Sleeping for 1 minute before next update...");
    //Utilities.sleep(60 * 1000); // 60秒 = 1分钟
    break;
  }
}
