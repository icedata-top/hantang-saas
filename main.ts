import { app, processVideoTasks } from './src/index.ts'

// const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

Deno.serve({ port: 8787 },app.fetch)

Deno.cron("sample cron", "* * * * *", async () => {
  console.log("cron job running every minute");
  const result = await processVideoTasks();
  console.log("Processed video tasks:", result);
});