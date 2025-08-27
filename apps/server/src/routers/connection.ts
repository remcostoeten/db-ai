import { eq } from "drizzle-orm";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db } from "../db";
import { connection } from "../db/schema/connections";
import { protectedProcedure } from "../lib/orpc";
import { create, find, getById, update, destroy, isDALError } from "../lib/dal";
import { DatabaseService } from "../lib/database-service";

const connectionInputSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	type: z.enum(["postgres", "mysql", "sqlite", "mongodb"], {
		errorMap: () => ({ message: "Database type must be postgres, mysql, sqlite, or mongodb" })
	}),
	host: z.string().optional(),
	port: z.string().optional(),
	database: z.string().optional(),
	username: z.string().optional(),
	password: z.string().optional(),
	connectionString: z.string().optional(),
	color: z.string().default("#3b82f6"),
	metadata: z.string().optional(),
}).refine(
	(data) => {
		// Either connectionString or individual fields should be provided
		if (!data.connectionString && (!data.host || !data.database)) {
			return false;
		}
		return true;
	},
	{
		message: "Either connection string or host/database must be provided",
		path: ["connectionString"],
	}
);

const connectionUpdateSchema = connectionInputSchema.partial().extend({
	id: z.string().uuid(),
});

export const connectionRouter = {
	// Get all user connections
	getAll: protectedProcedure.handler(async ({ context }) => {
		try {
			return await find(db, connection, {
				where: eq(connection.userId, context.session!.user.id),
			});
		} catch (error) {
			if (isDALError(error)) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
			}
			throw error;
		}
	}),

	// Get connection by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			try {
				const result = await getById(
					db,
					connection,
					input.id,
					eq(connection.userId, context.session!.user.id)
				);
				
				if (!result) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Create new connection
	create: protectedProcedure
		.input(connectionInputSchema)
		.handler(async ({ input, context }) => {
			try {
				const result = await create(db, connection, {
					...input,
					userId: context.session!.user.id,
					isActive: "true",
				});

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Update connection
	update: protectedProcedure
		.input(connectionUpdateSchema)
		.handler(async ({ input, context }) => {
			try {
				const { id, ...updateData } = input;
				
				const result = await update(
					db,
					connection,
					id,
					updateData,
					eq(connection.userId, context.session!.user.id)
				);

				if (!result) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Delete connection
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			try {
				const result = await destroy(
					db,
					connection,
					input.id,
					eq(connection.userId, context.session!.user.id)
				);

				if (!result) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				return { success: true };
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Test connection
	testConnection: protectedProcedure
		.input(connectionInputSchema)
		.handler(async ({ input }) => {
			try {
				const isValid = await DatabaseService.testConnection(input);
				return { success: isValid };
			} catch (error) {
				console.error("Connection test error:", error);
				return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
			}
		}),

	// Toggle connection active status
	toggleActive: protectedProcedure
		.input(z.object({ 
			id: z.string().uuid(),
			isActive: z.boolean()
		}))
		.handler(async ({ input, context }) => {
			try {
				const result = await update(
					db,
					connection,
					input.id,
					{ isActive: input.isActive ? "true" : "false" },
					eq(connection.userId, context.session!.user.id)
				);

				if (!result) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				return result;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),
};