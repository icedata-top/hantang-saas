import { randUA } from "@ahmedrangel/rand-user-agent";
import type { BatchedBiliResponse, BiliResponse } from "./types.ts";

const REQUEST_TIMEOUT_MS = 120_000;

// 生成随机的DedeUserID (10位整数)
function getRandomDedeUserID() {
  const min = 1000000000;
  const max = 1999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function callApiByUrlString(urlString: string): Promise<string> {
  try {
    const startTime = Date.now();
    const userAgent = randUA("desktop");
    const dedeUserID = getRandomDedeUserID();

    const headers = new Headers({
      "User-Agent": userAgent,
      Cookie: `buvid_fp_plain=undefined; DedeUserID=${dedeUserID};`,
    });

    const response = await fetch(urlString, {
      method: "GET",
      headers: headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 200) {
      const text = await response.text();
      const deltaTime = Date.now() - startTime;
      console.log(
        `Successfully get HTTP response from Bilibili. Time: ${deltaTime} ms, URL: ${urlString}, ua: ${userAgent}`,
      );
      return text;
    } else {
      console.error(
        `Failed to fetch video info. HTTP response code: ${response.status}, URL: ${urlString}, ua: ${userAgent}`,
      );
      throw new Error(
        `Failed to fetch video info. HTTP response code: ${response.status}`,
      );
    }
  } catch (e: any) {
    console.error(
      `Failed to construct URL or fetch video info: ${e.message}, URL: ${urlString}`,
    );
    throw new Error(
      `Failed to construct URL or fetch video info: ${e.message}`,
    );
  }
}

/**
 * 访问Bilibili API，批量获取视频信息。
 *
 * @param aidList 视频AV号列表
 * @return HTTP响应
 * @throws Error 如果请求失败或响应码不是200
 */
export function getVideoInfoApi(aidList: number[]): Promise<string> {
  const baseUrl = "https://api.bilibili.com/" +
    "medialist" +
    "/gateway" +
    "/base" +
    "/" +
    "resource" +
    "/" +
    "infos" +
    "?" +
    "resources=";
  const resources = aidList.map((aid) => `${aid}:2`).join(",");
  const urlString = baseUrl + resources;
  return callApiByUrlString(urlString);
}

/**
 * 批量获取视频信息，自动分批处理。
 *
 * @param aidList 视频AV号列表
 * @returns 按请求批次保留采样时间的 API 响应数据
 */
export async function batchGetVideoInfo(
  aidList: number[],
): Promise<BatchedBiliResponse> {
  const BATCH_SIZE = 50;
  const MAX_BATCHES = 47;
  const batchesWithTimestamps: BatchedBiliResponse["batches"] = [];
  const numAids = aidList.length;

  const shuffledAidList = [...aidList].sort(() => Math.random() - 0.5);

  if (numAids === 0) {
    return { code: 0, batches: [], message: "success" };
  }

  const batches: number[][] = [];

  if (numAids <= MAX_BATCHES * BATCH_SIZE) {
    for (let i = 0; i < numAids; i += BATCH_SIZE) {
      batches.push(shuffledAidList.slice(i, i + BATCH_SIZE));
    }
  } else {
    const itemsPerBatch = Math.ceil(numAids / MAX_BATCHES);
    for (let i = 0; i < numAids; i += itemsPerBatch) {
      batches.push(shuffledAidList.slice(i, i + itemsPerBatch));
      if (batches.length === MAX_BATCHES) {
        break;
      }
    }
  }

  for (const batch of batches) {
    const response = await getVideoInfoApi(batch);
    const parsedResponse = JSON.parse(response) as BiliResponse;
    if (parsedResponse.code !== 0) {
      return {
        code: parsedResponse.code,
        batches: [],
        message: parsedResponse.message,
      };
    }
    if (!Array.isArray(parsedResponse.data)) {
      throw new Error("Bilibili response is missing video data");
    }
    const sampledAt = Math.floor(Date.now() / 1000);

    batchesWithTimestamps.push({
      sampledAt,
      videos: parsedResponse.data,
    });
  }

  return { code: 0, batches: batchesWithTimestamps, message: "success" };
}
