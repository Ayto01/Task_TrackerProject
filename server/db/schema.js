import { boolean, pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const tasksTable = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false),
    ownerId: uuid("owner_id").references(() => usersTable.id)
});

export const usersTable = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull()
});

export const sessionsTable = pgTable("sessions", {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id").notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});