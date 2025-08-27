import { eq } from "drizzle-orm";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db } from "../db";
import { todo } from "../db/schema/todo";
import { protectedProcedure } from "../lib/orpc";
import { create, find, getById, update, destroy, isDALError } from "../lib/dal";

const todoInputSchema = z.object({
	text: z.string().min(1, "Text is required"),
});

const todoUpdateSchema = z.object({
	id: z.number(),
	text: z.string().min(1, "Text is required").optional(),
	completed: z.boolean().optional(),
});

export const todoRouter = {
	// Get all user todos
	getAll: protectedProcedure.handler(async ({ context }) => {
		try {
			return await find(db, todo, {
				where: eq(todo.userId, context.session!.user.id),
			});
		} catch (error) {
			if (isDALError(error)) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
			}
			throw error;
		}
	}),

	// Get todo by ID
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.handler(async ({ input, context }) => {
			try {
				const result = await getById(
					db,
					todo,
					input.id,
					eq(todo.userId, context.session!.user.id)
				);
				
				if (!result) {
					throw new ORPCError("NOT_FOUND", "Todo not found");
				}

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Create new todo
	create: protectedProcedure
		.input(todoInputSchema)
		.handler(async ({ input, context }) => {
			try {
				const result = await create(db, todo, {
					...input,
					userId: context.session!.user.id,
					completed: false,
				});

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Update todo
	update: protectedProcedure
		.input(todoUpdateSchema)
		.handler(async ({ input, context }) => {
			try {
				const { id, ...updateData } = input;
				
				const result = await update(
					db,
					todo,
					id,
					updateData,
					eq(todo.userId, context.session!.user.id)
				);

				if (!result) {
					throw new ORPCError("NOT_FOUND", "Todo not found");
				}

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Toggle todo completion
	toggle: protectedProcedure
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.handler(async ({ input, context }) => {
			try {
				const result = await update(
					db,
					todo,
					input.id,
					{ completed: input.completed },
					eq(todo.userId, context.session!.user.id)
				);

				if (!result) {
					throw new ORPCError("NOT_FOUND", "Todo not found");
				}

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Delete todo
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.handler(async ({ input, context }) => {
			try {
				const result = await destroy(
					db,
					todo,
					input.id,
					eq(todo.userId, context.session!.user.id)
				);

				if (!result) {
					throw new ORPCError("NOT_FOUND", "Todo not found");
				}

				return { success: true };
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),
};
