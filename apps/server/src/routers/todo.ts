import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { todo } from "../db/schema/todo";
import { publicProcedure } from "../lib/orpc";
import { create, destroy, get, update } from "../lib/dal";

export const todoRouter = {
	getAll: publicProcedure.handler(async () => {
		return await get(db, todo);
	}),
	create: publicProcedure
		.input(z.object({ text: z.string().min(1) }))
		.handler(async ({ input }) => {
			return await create(db, todo, { text: input.text });
		}),
	toggle: publicProcedure
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.handler(async ({ input }) => {
			return await update(db, todo, input.id, { completed: input.completed });
		}),
	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.handler(async ({ input }) => {
			return await destroy(db, todo, input.id);
		}),
};