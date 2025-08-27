import { pgTable, text, timestamp, serial, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const connection = pgTable("connections", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	type: text("type").notNull(), // postgres, mysql, sqlite, mongodb, etc.
	host: text("host"),
	port: text("port"),
	database: text("database"),
	username: text("username"),
	password: text("password"), // Should be encrypted in production
	connectionString: text("connection_string"), // Alternative to individual fields
	color: text("color").default("#3b82f6"), // For visual organization
	isActive: text("is_active").default("true").notNull(),
	metadata: text("metadata"), // JSON string for additional config
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const database = pgTable("databases", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	type: text("type").notNull(), // schema, catalog, etc.
	connectionId: uuid("connection_id")
		.notNull()
		.references(() => connection.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const table = pgTable("tables", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	schema: text("schema").default("public"),
	type: text("type").default("table").notNull(), // table, view, materialized_view, etc.
	rowCount: text("row_count"), // Stored as text to handle large numbers
	size: text("size"), // Human readable size
	comment: text("comment"),
	databaseId: uuid("database_id")
		.notNull()
		.references(() => database.id, { onDelete: "cascade" }),
	connectionId: uuid("connection_id")
		.notNull()
		.references(() => connection.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const column = pgTable("columns", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	type: text("type").notNull(), // varchar, int, timestamp, etc.
	isNullable: text("is_nullable").default("true").notNull(),
	defaultValue: text("default_value"),
	isPrimaryKey: text("is_primary_key").default("false").notNull(),
	isForeignKey: text("is_foreign_key").default("false").notNull(),
	referencedTable: text("referenced_table"),
	referencedColumn: text("referenced_column"),
	comment: text("comment"),
	ordinalPosition: text("ordinal_position"), // Column order in table
	tableId: uuid("table_id")
		.notNull()
		.references(() => table.id, { onDelete: "cascade" }),
	databaseId: uuid("database_id")
		.notNull()
		.references(() => database.id, { onDelete: "cascade" }),
	connectionId: uuid("connection_id")
		.notNull()
		.references(() => connection.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for TypeScript inference
export type Connection = typeof connection.$inferSelect;
export type NewConnection = typeof connection.$inferInsert;
export type Database = typeof database.$inferSelect;
export type NewDatabase = typeof database.$inferInsert;
export type Table = typeof table.$inferSelect;
export type NewTable = typeof table.$inferInsert;
export type Column = typeof column.$inferSelect;
export type NewColumn = typeof column.$inferInsert;