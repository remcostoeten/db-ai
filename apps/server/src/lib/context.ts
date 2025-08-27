import type { Context as HonoContext } from "hono";
import { auth } from "./auth";
import { env } from "cloudflare:workers";
import { db } from "../db";
import { user as userTable } from "../db/schema/auth";
import { and, eq } from "drizzle-orm";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});
	if (session?.user && env.ADMIN_EMAIL && session.user.email === env.ADMIN_EMAIL) {
		await db
			.update(userTable)
			.set({ role: "admin", updatedAt: new Date() })
			.where(and(eq(userTable.id, session.user.id), eq(userTable.role, "regular")));
	}
	return {
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
