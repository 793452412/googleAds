
export async function getDataByRe( data,regx) {
    const extractedUrl = ''
    let match = data.match(regx);
    if (match && match[1]) {
        let extractedUrl = match[1];
        return extractedUrl;

        console.log("提取到的URL:", extractedUrl);
    } else {
        console.log("未找到URL");
    }
    return extractedUrl;

}