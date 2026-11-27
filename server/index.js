import express from "express";
import cors from "cors";
import { eq } from "drizzle-orm";
import { db } from "./db/client.js";
import { tasksTable } from "./db/schema.js";

const app = express();
const host = "127.0.0.1";
const port = 3000;

app.use(cors({ origin: "http://localhost:63342" }));
app.use(express.json());

const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

app.param("id", (_request, response, next, id) => {
    if (!uuidPattern.test(id)) {
        return response.status(404).json({ error: "Task not found" });
    }

    next();
});

function readTitle(value) {
    return typeof value === "string" ? value.trim() : "";
}

app.get("/api/tasks", async (_request, response) => {
    const tasks = await db.select().from(tasksTable);
    response.json(tasks);
});

app.post("/api/tasks", async (request, response) => {
    const title = readTitle(request.body?.title);

    if (!title) {
        return response.status(400).json({ error: "Task title is required." });
    }

    const [task] = await db.insert(tasksTable).values({ title }).returning();
    response.status(201).json(task);
});

app.patch("/api/tasks/:id", async (request, response) => {
    const { title, completed } = request.body ?? {};
    const changes = {};

    if (title !== undefined) {
        changes.title = readTitle(title);

        if (!changes.title) {
            return response.status(400).json({ error: "Task title is required." });
        }
    }

    if (completed !== undefined) {
        if (typeof completed !== "boolean") {
            return response.status(400).json({
                error: "Completed must be true or false."
            });
        }

        changes.completed = completed;
    }

    if (Object.keys(changes).length === 0) {
        return response.status(400).json({
            error: "Provide a title or completion state."
        });
    }

    const [task] = await db.update(tasksTable)
        .set(changes)
        .where(eq(tasksTable.id, request.params.id))
        .returning();

    if (!task) {
        return response.status(404).json({ error: "Task not found" });
    }

    response.json(task);
});

app.delete("/api/tasks/:id", async (request, response) => {
    const [task] = await db.delete(tasksTable)
        .where(eq(tasksTable.id, request.params.id))
        .returning({ id: tasksTable.id });

    if (!task) {
        return response.status(404).json({ error: "Task not found" });
    }

    response.status(204);
    response.end();
});

app.listen(port, host, () => {
    console.log(`Task API running at http://${host}:${port}`);
});