import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { SQL, eq } from 'drizzle-orm';
import type { AnyColumn } from 'drizzle-orm';
import { DALError } from './create';

function handleDALError(operation: string, error: unknown): never {
	if (error instanceof Error) {
		throw new DALError(operation, error, error.message);
	}
	
	if (typeof error === 'string') {
		throw new DALError(operation, error, error);
	}
	
	throw new DALError(operation, error, `Unknown error during ${operation}`);
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