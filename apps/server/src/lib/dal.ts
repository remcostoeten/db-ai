import { and, eq, type SQL, count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { db as Database } from "../db";

export class DALError extends Error {
	constructor(
		message: string,
		public code: string = "DAL_ERROR",
		public cause?: unknown,
	) {
		super(message);
		this.name = "DALError";
	}
}

export function isDALError(error: unknown): error is DALError {
	return error instanceof DALError;
}

type DBType = typeof Database;

/**
 * Create a new record
 */
export async function create<T extends PgTable>(
	db: DBType,
	schema: T,
	values: T["$inferInsert"],
) {
	try {
		const result = await db.insert(schema).values(values).returning();
		return result[0];
	} catch (error) {
		throw new DALError(
			`Failed to create record in ${schema._.name}`,
			"CREATE_ERROR",
			error,
		);
	}
}

/**
 * Get all records
 */
export async function get<T extends PgTable>(db: DBType, schema: T) {
	try {
		return await db.select().from(schema);
	} catch (error) {
		throw new DALError(
			`Failed to get records from ${schema._.name}`,
			"GET_ERROR",
			error,
		);
	}
}

/**
 * Find records with advanced filtering
 */
export async function find<T extends PgTable>(
	db: DBType,
	schema: T,
	options: {
		where?: SQL;
		limit?: number;
		offset?: number;
		orderBy?: SQL;
	} = {},
) {
	try {
		let query = db.select().from(schema);

		if (options.where) {
			query = query.where(options.where);
		}

		if (options.orderBy) {
			query = query.orderBy(options.orderBy);
		}

		if (options.limit) {
			query = query.limit(options.limit);
		}

		if (options.offset) {
			query = query.offset(options.offset);
		}

		return await query;
	} catch (error) {
		throw new DALError(
			`Failed to find records in ${schema._.name}`,
			"FIND_ERROR",
			error,
		);
	}
}

/**
 * Get a single record by ID
 */
export async function getById<T extends PgTable>(
	db: DBType,
	schema: T,
	id: string | number,
	additionalWhere?: SQL,
) {
	try {
		const idColumn = schema.id as any; // Type assertion for id column
		let whereClause: SQL = eq(idColumn, id);

		if (additionalWhere) {
			whereClause = and(whereClause, additionalWhere);
		}

		const result = await db.select().from(schema).where(whereClause).limit(1);
		return result[0] || null;
	} catch (error) {
		throw new DALError(
			`Failed to get record by ID from ${schema._.name}`,
			"GET_BY_ID_ERROR",
			error,
		);
	}
}

/**
 * Update a record by ID
 */
export async function update<T extends PgTable>(
	db: DBType,
	schema: T,
	id: string | number,
	values: Partial<T["$inferInsert"]>,
	additionalWhere?: SQL,
) {
	try {
		const idColumn = schema.id as any; // Type assertion for id column
		let whereClause: SQL = eq(idColumn, id);

		if (additionalWhere) {
			whereClause = and(whereClause, additionalWhere);
		}

		const result = await db
			.update(schema)
			.set({
				...values,
				updatedAt: new Date(),
			} as any)
			.where(whereClause)
			.returning();

		return result[0] || null;
	} catch (error) {
		throw new DALError(
			`Failed to update record in ${schema._.name}`,
			"UPDATE_ERROR",
			error,
		);
	}
}

/**
 * Delete a record by ID
 */
export async function destroy<T extends PgTable>(
	db: DBType,
	schema: T,
	id: string | number,
	additionalWhere?: SQL,
) {
	try {
		const idColumn = schema.id as any; // Type assertion for id column
		let whereClause: SQL = eq(idColumn, id);

		if (additionalWhere) {
			whereClause = and(whereClause, additionalWhere);
		}

		const result = await db
			.delete(schema)
			.where(whereClause)
			.returning();

		return result[0] || null;
	} catch (error) {
		throw new DALError(
			`Failed to delete record from ${schema._.name}`,
			"DELETE_ERROR",
			error,
		);
	}
}

/**
 * Count records with optional filtering
 */
export async function count<T extends PgTable>(
	db: DBType,
	schema: T,
	where?: SQL,
) {
	try {
		let query = db.select({ count: count() }).from(schema);

		if (where) {
			query = query.where(where);
		}

		const result = await query;
		return result[0]?.count || 0;
	} catch (error) {
		throw new DALError(
			`Failed to count records in ${schema._.name}`,
			"COUNT_ERROR",
			error,
		);
	}
}