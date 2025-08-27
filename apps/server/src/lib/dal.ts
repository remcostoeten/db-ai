import { eq, SQL, type AnyColumn } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

export class DALError extends Error {
	constructor(
		public operation: string,
		public originalError: unknown,
		message?: string
	) {
		const errorMessage = message || `DAL ${operation} operation failed`;
		super(errorMessage);
		this.name = 'DALError';
		
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, DALError);
		}
	}
}

function handleDALError(operation: string, error: unknown): never {
	if (error instanceof Error) {
		throw new DALError(operation, error, error.message);
	}
	
	if (typeof error === 'string') {
		throw new DALError(operation, error, error);
	}
	
	throw new DALError(operation, error, `Unknown error during ${operation}`);
}

export function isDALError(error: unknown): error is DALError {
	return error instanceof DALError;
}

export async function create<T>(
	db: NeonHttpDatabase<Record<string, never>>,
	schema: unknown,
	values: T
) {
	try {
		const result = await db
			.insert(schema as never)
			.values(values as never)
			.returning();
		return result;
	} catch (e) {
		handleDALError('create', e);
	}
}

export async function destroy<T extends { id: unknown }>(
	db: NeonHttpDatabase<Record<string, never>>,
	schema: unknown,
	id: T['id'],
	additionalWhere?: SQL | undefined
) {
	try {
		let query: any = db
			.delete(schema as never)
			.where(eq((schema as any).id, id));

		if (additionalWhere) {
			query = query.where(additionalWhere);
		}

		const result = (await query.returning()) as T[];
		return result[0];
	} catch (e) {
		handleDALError('destroy', e);
	}
}

type FindOptions = {
	columns?: any;
	where?: any;
	orderBy?: SQL | SQL[] | AnyColumn | AnyColumn[];
	limit?: number;
	offset?: number;
};

export async function get<T>(
	db: NeonHttpDatabase<Record<string, never>>,
	schema: unknown
): Promise<T[]> {
	try {
		const result = (await db.select().from(schema as never)) as T[];
		return result;
	} catch (e) {
		handleDALError('get', e);
	}
}

export async function find<T>(
	db: NeonHttpDatabase<Record<string, never>>,
	schema: unknown,
	options: FindOptions = {}
): Promise<T[]> {
	const { columns, where, orderBy, limit, offset } = options;
	try {
		let query: any = db.select(columns).from(schema as never);

		if (where) {
			query = query.where(where);
		}

		if (orderBy) {
			query = query.orderBy(orderBy);
		}

		if (limit) {
			query = query.limit(limit);
		}

		if (offset) {
			query = query.offset(offset);
		}

		const result = (await query) as T[];
		return result;
	} catch (e) {
		handleDALError('find', e);
	}
}

export async function getById<T extends { id: unknown }>(
	db: NeonHttpDatabase<Record<string, never>>,
	schema: unknown,
	id: T['id']
): Promise<T | null> {
	try {
		const result = (await db
			.select()
			.from(schema as never)
			.where(eq((schema as any).id, id))
			.limit(1)) as T[];
		return result[0] || null;
	} catch (e) {
		handleDALError('getById', e);
	}
}

export async function update<T extends { id: unknown }>(
	db: NeonHttpDatabase<Record<string, never>>,
	schema: unknown,
	id: T['id'],
	values: Partial<Omit<T, 'id'>>,
	additionalWhere?: SQL | undefined
) {
	try {
		let query: any = db
			.update(schema as never)
			.set(values as never)
			.where(eq((schema as any).id, id));

		if (additionalWhere) {
			query = query.where(additionalWhere);
		}

		const result = (await query.returning()) as T[];
		return result[0];
	} catch (e) {
		handleDALError('update', e);
	}
}
