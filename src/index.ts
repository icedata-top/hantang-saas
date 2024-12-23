import { Hono } from "hono";
import { getVideoInfoApi, batchGetVideoInfo } from "./BilibiliApi";
import { TaskResponse, BiliResponse } from "./types";

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
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }

  const aids = json.result
    .map((item) => item.aid)
    .filter((aid) => typeof aid === "number") as number[];

  console.log(`Starting task with ${aids.length} videos`);

  const data: BiliResponse = (await batchGetVideoInfo(aids)) as BiliResponse;
  if (data.message !== "success") {
    return c.json({ error: "Failed to fetch video info" }, 500);
  }
});

export default app;
