/**
 * @name entitySchema
 * @description Defines a base schema for database entities.
 * It includes a UUID primary key and timestamp fields for tracking creation and modification.
 */

import { uuid } from 'drizzle-orm/pg-core';
import { timestampFields } from './timestamps';

export function entitySchema() {
	return {
		id: uuid().primaryKey().defaultRandom(),
		...timestampFields(),
	};
}
