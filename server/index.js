import express from "express";
import { eq ,and } from "drizzle-orm";
import { db } from "./db/client.js";
import { hashPassword, verifyPassword } from "./password.js";
import { tasksTable, usersTable } from "./db/schema.js";
import { startSession, getSessionUser, endSession } from "./session.js";
import { fileURLToPath } from "node:url";


const app = express();
const host = "127.0.0.1";
const port = 3000;

app.use(express.json());

async function requireAuth(request, response, next) {
    response.set("Cache-Control", "no-store");

    const user = await getSessionUser(request);

    if (!user) {
        return response.status(401).json({ error: "Sign in to continue." });
    }

    request.user = user;
    next();
}

app.use("/api/tasks", requireAuth);

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

app.get("/api/tasks", async (request, response) => {
    const tasks = await db.select()
        .from(tasksTable)
        .where(eq(tasksTable.ownerId, request.user.id));

    response.json(tasks);
});

app.post("/api/tasks", async (request, response) => {
    const title = readTitle(request.body?.title);

    if (!title) {
        return response.status(400).json({ error: "Task title is required." });
    }

    const [task] = await db.insert(tasksTable)
        .values({ title, ownerId: request.user.id })
        .returning();

    return response.status(201).json(task);
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
        .where(and(
            eq(tasksTable.id, request.params.id),
            eq(tasksTable.ownerId, request.user.id)
        ))
        .returning();

    if (!task) {
        return response.status(404).json({ error: "Task not found" });
    }

    response.json(task);
});

app.delete("/api/tasks/:id", async (request, response) => {
    const [deletedTask] = await db.delete(tasksTable)
        .where(and(
            eq(tasksTable.id, request.params.id),
            eq(tasksTable.ownerId, request.user.id)
        ))
        .returning({ id: tasksTable.id });

    if (!deletedTask) {
        return response.status(404).json({ error: "Task not found" });
    }

    response.status(204);
    response.end();
});

app.post("/api/auth/register", async (request, response) => {
    const rawEmail = request.body?.email;
    const email = typeof rawEmail === "string"
        ? rawEmail.trim().toLowerCase()
        : "";
    const password = request.body?.password;

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return response.status(400).json({ error: "Enter a valid email address." });
    }

    if (typeof password !== "string" || password.length < 12 || password.length > 128) {
        return response.status(400).json({
            error: "Use a password between 12 and 128 characters."
        });
    }

    try {
        const passwordHash = await hashPassword(password);

        const [user] = await db.insert(usersTable)
            .values({ email, passwordHash })
            .onConflictDoNothing({ target: usersTable.email })
            .returning({ id: usersTable.id, email: usersTable.email });

        if (!user) {
            return response.status(409).json({ error: "Email is already registered." });
        }

        response.status(201).json({ user });
    } catch (error) {
        console.error("Registration failed.", error.cause?.code ?? error.code ?? error.name);
        response.status(500).json({ error: "Could not create the account." });
    }
});


app.post("/api/auth/login", async (request, response) => {
    const rawEmail = request.body?.email;
    const email = typeof rawEmail === "string"
        ? rawEmail.trim().toLowerCase()
        : "";
    const password = request.body?.password;

    if (
        !email ||
        email.length > 254 ||
        typeof password !== "string" ||
        password.length < 12 ||
        password.length > 128
    ) {
        return response.status(400).json({
            error: "Enter a valid email address and password."
        });
    }

    try {
        const [user] = await db.select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        const matches = await verifyPassword(password, user?.passwordHash);

        if (!user || !matches) {
            return response.status(401).json({
                error: "Invalid email or password."
            });
        }
        await startSession(request, response, user.id);
        response.status(200).json({
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error("Login failed.", error.cause?.code ?? error.code ?? error.name);
        response.status(500).json({ error: "Could not sign in." });
    }
});

app.get("/api/auth/me", async (request, response) => {
    response.set("Cache-Control", "no-store");

    const user = await getSessionUser(request);

    if (!user) {
        return response.status(401).json({ error: "Sign in to continue." });
    }

    response.json({ user });
});

app.post("/api/auth/logout", async (request, response) => {
    response.set("Cache-Control", "no-store");

    await endSession(request, response);

    response.status(204);
    response.end();
});

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));
app.use(express.static(publicPath));

app.listen(port, host, (error) => {
    if (error) {
        console.error("Could not start the API:", error.code ?? error.message);
        process.exitCode = 1;
        return;
    }

    console.log(`Task API running at http://${host}:${port}`);
});