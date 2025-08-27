/**
 * @name timestampFields
 * @description Defines a reusable set of timestamp fields for database tables using Drizzle ORM.
 * Includes createdAt and updatedAt fields.
 * @example
 * ```ts
 * const schema = {
 *   ...entitySchema(),
 *   ...timestampFields(),
 * };
 * ```
 */

import { timestamp } from 'drizzle-orm/pg-core';

export function timestampFields() {
	return {
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	};
}
