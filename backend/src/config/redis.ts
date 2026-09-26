import { createClient } from "redis";
import { config } from "./config";

export const redisClient = createClient({ url: config.redisUrl });

redisClient.on("error", (err) => {
  console.error("[redis] error", err);
});

redisClient.on("connect", () => {
  console.log("[redis] connected");
});

export async function connectRedis() {
  await redisClient.connect();
}