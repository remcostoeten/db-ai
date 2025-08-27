import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "cloudflare:workers";
import ws from "ws";
import * as auth from "./schema/auth";
import * as todo from "./schema/todo";
import * as connections from "./schema/connections";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const sql = neon(env.DATABASE_URL || "");
export const db = drizzle(sql, {
	schema: { ...auth, ...todo, ...connections },
});
