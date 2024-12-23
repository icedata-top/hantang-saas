// getVideoInfoApi.ts

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1"
];

// 生成随机User-Agent
function getRandomUserAgent() {
    const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
    return USER_AGENTS[randomIndex];
}

// 生成随机的DedeUserID (10位整数)
function getRandomDedeUserID() {
    const min = 1000000000;
    const max = 1999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function callApiByUrlString(urlString: string): Promise<string> {
    try {
        const startTime = Date.now();
        const userAgent = getRandomUserAgent();
        const dedeUserID = getRandomDedeUserID();

        const headers = new Headers({
            "User-Agent": userAgent,
            "Cookie": `buvid_fp_plain=undefined; DedeUserID=${dedeUserID};`
        });

        const response = await fetch(urlString, {
            method: "GET",
            headers: headers,
        });

        if (response.status === 200) {
            const text = await response.text();
            const deltaTime = Date.now() - startTime;
            console.log(`Successfully get HTTP response from Bilibili. Time: ${deltaTime} ms, URL: ${urlString}`);
            return text;
        } else {
            console.error(`Failed to fetch video info. HTTP response code: ${response.status}, URL: ${urlString}`);
            throw new Error(`Failed to fetch video info. HTTP response code: ${response.status}`);
        }
    } catch (e: any) {
        console.error(`Failed to construct URL or fetch video info: ${e.message}, URL: ${urlString}`);
        throw new Error(`Failed to construct URL or fetch video info: ${e.message}`);
    }
}

/**
 * 访问Bilibili API，批量获取视频信息。
 *
 * @param aidList 视频AV号列表
 * @return HTTP响应
 * @throws Error 如果请求失败或响应码不是200
 */
export async function getVideoInfoApi(aidList: number[]): Promise<string> {
    const baseUrl = "https://api.bilibili.com/" + "medialist" + "/gateway" + "/base" + "/" + "resource" + "/" + "infos" + "?" + "resources=";
    const resources = aidList.map(aid => `${aid}:2`).join(",");
    const urlString = baseUrl + resources;
    return callApiByUrlString(urlString);
}