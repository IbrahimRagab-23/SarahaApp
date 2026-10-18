import { createClient } from "redis"
import { REDIS_URI } from "../config.js";

export const client = createClient({
  url: REDIS_URI
});
export async function connectRedis() {
    try {
        await client.connect();
        console.log("Redis connection established successfully");
        
    } catch (error) {
        
        console.log("Failed to establish Redis connection");
    }
}