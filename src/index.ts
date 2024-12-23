import { Hono } from 'hono'
import { getVideoInfoApi } from './BilibiliApi'

type Bindings = {
  APIBASE: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const apibase = c.env.APIBASE

  let data = await fetch(`${apibase}`)

  let json = await data.json()

  return new Response(JSON.stringify(json), {
    headers: { 'content-type': 'application/json' },
  })
})

app.get('/video/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const data = await getVideoInfoApi([id])
  return new Response(data, {
    headers: { 'content-type': 'application/json' },
  })
})

export default app
