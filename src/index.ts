import { Hono } from "hono";
import { getVideoInfoApi, batchGetVideoInfo } from "./BilibiliApi";
import { TaskResponse, BiliResponse, BackendResponse } from "./types";

type Bindings = {
  APIBASE: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const apibase = c.env.APIBASE;

  let data = await fetch(`${apibase}`);

  let json = await data.json();

  return new Response(JSON.stringify(json), {
    headers: { "content-type": "application/json" },
  });
});

app.get("/video/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = await getVideoInfoApi([id]);
  return new Response(data, {
    headers: { "content-type": "application/json" },
  });
});

app.get("/gettasks", async (c) => {
  const apibase = c.env.APIBASE;
  const response = await fetch(`${apibase}/get_video_static_by_priority`);
  const json: TaskResponse = (await response.json()) as TaskResponse;

  if (json.status !== "success") {
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }

  const aids = json.result
    .map((item) => item.aid)
    .filter((aid) => typeof aid === "number") as number[];

  return c.json({ aids });
});

app.get("/starttask", async (c) => {
  const apibase = c.env.APIBASE;
  const response = await fetch(`${apibase}/get_video_static_by_priority`);
  const json: TaskResponse = (await response.json()) as TaskResponse;

  if (json.status !== "success") {
    return c.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }

  const aids = json.result
    .map((item) => item.aid)
    .filter((aid) => typeof aid === "number") as number[];

  console.log(`Starting task with ${aids.length} videos`);

  const data: BiliResponse = (await batchGetVideoInfo(aids)) as BiliResponse;
  if (data.message !== "success") {
    return c.json({ error: "Failed to fetch video info" }, { status: 500 });
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
      console.error(
        "Failed to add video minutes:",
        postResponse.status,
        await postResponse.text()
      );
      return c.json(
        { error: "Failed to add video minutes" },
        { status: postResponse.status }
      );
    }

    const postResult: BackendResponse =
      (await postResponse.json()) as BackendResponse;
    if (postResult.status === "success") {
      console.log("Successfully added video minutes:", postResult);
      return c.json({
        message: "Successfully added video minutes",
        result: postResult,
      });
    } else {
      console.error("Failed to add video minutes:", postResult);
      return c.json(
        { error: "Failed to add video minutes", details: postResult },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending request to backend:", error);
    return c.json(
      { error: "Error sending request to backend", details: error },
      { status: 500 }
    );
  }
});

export default app;
