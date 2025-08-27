import { eq, SQL } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
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
