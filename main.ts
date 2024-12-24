import { app, processVideoTasks } from './src/index.ts'

// const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

Deno.serve({ port: 8787 },app.fetch)

Deno.cron("minut add", "* * * * *", async () => {
  const timenow = new Date().toISOString();
  console.log("cron job running every minute");
  const result = await processVideoTasks();
  const timeend = new Date().toISOString();
  const duration = new Date(timeend).getTime() - new Date(timenow).getTime();
  console.log("Processed video tasks at", timenow, "and ended at", timeend, ", lasted for", duration, "ms");
  if (result.result.status !== "success") {
    console.error("Failed to process video tasks:", result);
  }
});