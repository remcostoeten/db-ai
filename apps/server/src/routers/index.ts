import { protectedProcedure, publicProcedure } from "../lib/orpc";
import type { RouterClient } from "@orpc/server";
import { todoRouter } from "./todo";
import { connectionRouter } from "./connection";
import { databaseRouter, tableRouter, columnRouter } from "./database";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	todo: todoRouter,
	connection: connectionRouter,
	database: databaseRouter,
	table: tableRouter,
	column: columnRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
