import { Hono } from "hono";
import { getVideoInfoApi, batchGetVideoInfo } from "./BilibiliApi.ts";
import { TaskResponse, BiliResponse, BackendResponse } from "./types.ts";

function getAPIBASE() {
  return Deno.env.get("APIBASE") || "http://localhost:8000";
}

const app = new Hono();

async function fetchTasks(apibase: string): Promise<number[]> {
  const response = await fetch(`${apibase}/get_video_static_by_priority`);
  const json: TaskResponse = (await response.json()) as TaskResponse;

  if (json.status !== "success") {
    throw new Error("Failed to fetch tasks");
  }

  return json.result
    .map((item) => item.aid)
    .filter((aid) => typeof aid === "number") as number[];
}

export async function processVideoTasks() {
  const apibase = getAPIBASE();
  const aids = await fetchTasks(apibase);
  console.log(`Starting task with ${aids.length} videos`);

  const data: BiliResponse = (await batchGetVideoInfo(aids)) as BiliResponse;
  if (data.message !== "success") {
    throw new Error("Failed to fetch video info");
  }

  const videoMinutes = data.data.map((video) => ({
    time: Math.floor(Date.now() / 1000),
    aid: video.id,
    bvid: video.bvid,
    coin: video.cnt_info.coin,
    favorite: video.cnt_info.collect,
    danmaku: video.cnt_info.danmaku,
    view: video.cnt_info.play,
    reply: video.cnt_info.reply,
    share: video.cnt_info.share,
    like: video.cnt_info.thumb_up,
  }));

  try {
    const postResponse = await fetch(`${apibase}/add_video_minute_bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(videoMinutes),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error(
        "Failed to add video minutes:",
        postResponse.status,
        errorText
      );
      throw new Error(
        `Failed to add video minutes: ${postResponse.status} - ${errorText}`
      );
    }

    const postResult: BackendResponse =
      (await postResponse.json()) as BackendResponse;
    if (postResult.status === "success") {
      console.log("Successfully added video minutes");
      return {
        message: "Successfully added video minutes",
        result: postResult,
      };
    } else {
      console.error("Failed to add video minutes:", postResult);
      throw new Error(
        `Failed to add video minutes: ${JSON.stringify(postResult)}`
      );
    }
  } catch (error) {
    console.error("Error sending request to backend:", error);
    throw new Error(`Error sending request to backend: ${error}`);
  }
}

app.get("/", async (c) => {
  const apibase = getAPIBASE();
  console.log("Fetching base API:", apibase);

  try {
    const data = await fetch(`${apibase}`);
    const json = (await data.json()) as Record<string, unknown>;
    return c.json(json);
  } catch (error) {
    console.error("Error fetching base API:", error);
    return c.json({ error: "Failed to fetch base API" }, 500);
  }
});

app.get("/video/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const apibase = getAPIBASE();
  try {
    const data = await getVideoInfoApi([id]);
    return new Response(data, {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return c.json({ error: "Failed to fetch video info" }, 500);
  }
});

app.get("/gettasks", async (c) => {
  const apibase = getAPIBASE();
  try {
    const aids = await fetchTasks(apibase);
    return c.json({ aids });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get("/starttask", async (c) => {
  try {
    const result = await processVideoTasks();
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export { app };
