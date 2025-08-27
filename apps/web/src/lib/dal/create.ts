import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

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