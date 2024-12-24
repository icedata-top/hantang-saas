import { Hono } from 'hono'
import { getVideoInfoApi, batchGetVideoInfo } from './src/BilibiliApi'
import { TaskResponse, BiliResponse, BackendResponse } from './src/types'
import { app } from './src/index'

// const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

Deno.serve(app.fetch)
