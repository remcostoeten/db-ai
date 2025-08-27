import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db } from "../db";
import { database, table, column, connection } from "../db/schema/connections";
import { protectedProcedure } from "../lib/orpc";
import { create, find, getById, update, destroy, isDALError } from "../lib/dal";
import { DatabaseService } from "../lib/database-service";

export const databaseRouter = {
	// Get databases for a connection
	getByConnectionId: protectedProcedure
		.input(z.object({ connectionId: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			try {
				// First verify the connection belongs to the user
				const connectionResult = await getById(
					db,
					connection,
					input.connectionId,
					eq(connection.userId, context.session!.user.id)
				);

				if (!connectionResult) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				return await find(db, database, {
					where: and(
						eq(database.connectionId, input.connectionId),
						eq(database.userId, context.session!.user.id)
					),
				});
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Sync databases from connection
	syncFromConnection: protectedProcedure
		.input(z.object({ connectionId: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			try {
				// First verify the connection belongs to the user
				const connectionResult = await getById(
					db,
					connection,
					input.connectionId,
					eq(connection.userId, context.session!.user.id)
				);

				if (!connectionResult) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				// Get databases from the actual database connection
				const remoteDatabases = await DatabaseService.getDatabases(connectionResult);

				// Clear existing databases for this connection
				await db.delete(database).where(
					and(
						eq(database.connectionId, input.connectionId),
						eq(database.userId, context.session!.user.id)
					)
				);

				// Insert new databases
				const createdDatabases = [];
				for (const remoteDb of remoteDatabases) {
					const created = await create(db, database, {
						name: remoteDb.name,
						type: remoteDb.type,
						connectionId: input.connectionId,
						userId: context.session!.user.id,
					});
					createdDatabases.push(created);
				}

				return createdDatabases;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),
};

export const tableRouter = {
	// Get tables for a database
	getByDatabaseId: protectedProcedure
		.input(z.object({ databaseId: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			try {
				// Verify the database belongs to the user
				const databaseResult = await getById(
					db,
					database,
					input.databaseId,
					eq(database.userId, context.session!.user.id)
				);

				if (!databaseResult) {
					throw new ORPCError("NOT_FOUND", "Database not found");
				}

				return await find(db, table, {
					where: and(
						eq(table.databaseId, input.databaseId),
						eq(table.userId, context.session!.user.id)
					),
				});
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Sync tables from database
	syncFromDatabase: protectedProcedure
		.input(z.object({ 
			databaseId: z.string().uuid(),
			databaseName: z.string().optional()
		}))
		.handler(async ({ input, context }) => {
			try {
				// Verify the database belongs to the user
				const databaseResult = await getById(
					db,
					database,
					input.databaseId,
					eq(database.userId, context.session!.user.id)
				);

				if (!databaseResult) {
					throw new ORPCError("NOT_FOUND", "Database not found");
				}

				// Get the connection
				const connectionResult = await getById(
					db,
					connection,
					databaseResult.connectionId,
					eq(connection.userId, context.session!.user.id)
				);

				if (!connectionResult) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				// Get tables from the actual database
				const remoteTables = await DatabaseService.getTables(
					connectionResult,
					input.databaseName || databaseResult.name
				);

				// Clear existing tables for this database
				await db.delete(table).where(
					and(
						eq(table.databaseId, input.databaseId),
						eq(table.userId, context.session!.user.id)
					)
				);

				// Insert new tables
				const createdTables = [];
				for (const remoteTable of remoteTables) {
					const created = await create(db, table, {
						name: remoteTable.name,
						schema: remoteTable.schema,
						type: remoteTable.type,
						rowCount: remoteTable.rowCount?.toString(),
						size: remoteTable.size,
						comment: remoteTable.comment,
						databaseId: input.databaseId,
						connectionId: databaseResult.connectionId,
						userId: context.session!.user.id,
					});
					createdTables.push(created);
				}

				return createdTables;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),
};

export const columnRouter = {
	// Get columns for a table
	getByTableId: protectedProcedure
		.input(z.object({ tableId: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			try {
				// Verify the table belongs to the user
				const tableResult = await getById(
					db,
					table,
					input.tableId,
					eq(table.userId, context.session!.user.id)
				);

				if (!tableResult) {
					throw new ORPCError("NOT_FOUND", "Table not found");
				}

				return await find(db, column, {
					where: and(
						eq(column.tableId, input.tableId),
						eq(column.userId, context.session!.user.id)
					),
				});
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),

	// Sync columns from table
	syncFromTable: protectedProcedure
		.input(z.object({ 
			tableId: z.string().uuid(),
			schemaName: z.string().optional()
		}))
		.handler(async ({ input, context }) => {
			try {
				// Verify the table belongs to the user
				const tableResult = await getById(
					db,
					table,
					input.tableId,
					eq(table.userId, context.session!.user.id)
				);

				if (!tableResult) {
					throw new ORPCError("NOT_FOUND", "Table not found");
				}

				// Get the connection
				const connectionResult = await getById(
					db,
					connection,
					tableResult.connectionId,
					eq(connection.userId, context.session!.user.id)
				);

				if (!connectionResult) {
					throw new ORPCError("NOT_FOUND", "Connection not found");
				}

				// Get columns from the actual table
				const remoteColumns = await DatabaseService.getColumns(
					connectionResult,
					tableResult.name,
					input.schemaName || tableResult.schema
				);

				// Clear existing columns for this table
				await db.delete(column).where(
					and(
						eq(column.tableId, input.tableId),
						eq(column.userId, context.session!.user.id)
					)
				);

				// Insert new columns
				const createdColumns = [];
				for (const remoteColumn of remoteColumns) {
					const created = await create(db, column, {
						name: remoteColumn.name,
						type: remoteColumn.type,
						isNullable: remoteColumn.isNullable ? "true" : "false",
						defaultValue: remoteColumn.defaultValue,
						isPrimaryKey: remoteColumn.isPrimaryKey ? "true" : "false",
						isForeignKey: remoteColumn.isForeignKey ? "true" : "false",
						referencedTable: remoteColumn.referencedTable,
						referencedColumn: remoteColumn.referencedColumn,
						comment: remoteColumn.comment,
						ordinalPosition: remoteColumn.ordinalPosition.toString(),
						tableId: input.tableId,
						databaseId: tableResult.databaseId,
						connectionId: tableResult.connectionId,
						userId: context.session!.user.id,
					});
					createdColumns.push(created);
				}

				return createdColumns;
			} catch (error) {
				if (isDALError(error)) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", error.message);
				}
				throw error;
			}
		}),
};