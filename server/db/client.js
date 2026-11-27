import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";

dotenv.config({
    path: fileURLToPath(new URL("../.env", import.meta.url))
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("Check DATABASE_URL in server/.env.");
}

export const db = drizzle(databaseUrl);