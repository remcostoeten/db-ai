import { env } from "cloudflare:workers";
import { RPCHandler } from "@orpc/server/fetch";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { WebRTCSignalingServer } from "./lib/websocket";

const app = new Hono();
const signalingServer = new WebRTCSignalingServer();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = new RPCHandler(appRouter);
app.use("/rpc/*", async (c, next) => {
	const context = await createContext({ context: c });
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/rpc",
		context: context,
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}
	await next();
});

app.get("/", (c) => {
	return c.text("OK");
});

// WebSocket upgrade handler
app.get("/ws", (c) => {
	const upgradeHeader = c.req.header("upgrade");
	if (upgradeHeader !== "websocket") {
		return c.text("Expected websocket", 400);
	}

	const [client, server] = new WebSocketPair();
	signalingServer.handleWebSocket(server);
	
	return new Response(null, { status: 101, webSocket: client });
});

export default app;
