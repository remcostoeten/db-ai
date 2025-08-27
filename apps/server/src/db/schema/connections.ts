import { pgTable, text } from 'drizzle-orm/pg-core';
import { timestampFields } from '../helpers/timestamps';
import { user } from './auth';

export const connections = pgTable('connections', {
	id: text('id').primaryKey(),
	...timestampFields(),
	user_id: text('user_id').references(() => user.id),
	name: text('name').notNull(),
	url: text('url').notNull(),
	authToken: text('auth_token').notNull(),
	description: text('description').notNull(),
	color: text('color').notNull(),
	type: text('type').notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
