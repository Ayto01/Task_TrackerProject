import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const tasksTable = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false)
});