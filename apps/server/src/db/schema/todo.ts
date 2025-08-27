import { pgTable, text, boolean, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const todo = pgTable("todo", {
	id: serial("id").primaryKey(),
	text: text("text").notNull(),
	completed: boolean("completed").default(false).notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Todo = typeof todo.$inferSelect;
export type NewTodo = typeof todo.$inferInsert;
