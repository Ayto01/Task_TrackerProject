import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "./db/client.js";
import { sessionsTable, usersTable } from "./db/schema.js";

const cookieName = "task_session";
const sessionDuration = 24 * 60 * 60 * 1000;
const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
};

function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

function readSessionHash(request) {
    const entry = (request.get("Cookie") ?? "")
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${cookieName}=`));

    const token = entry?.slice(cookieName.length + 1);
    return token && /^[0-9a-f]{64}$/.test(token) ? hashToken(token) : null;
}

export async function startSession(request, response, userId) {
    const token = randomBytes(32).toString("hex");
    const previousHash = readSessionHash(request);
    const expiresAt = new Date(Date.now() + sessionDuration);

    await db.transaction(async (transaction) => {
        if (previousHash) {
            await transaction.delete(sessionsTable)
                .where(eq(sessionsTable.tokenHash, previousHash));
        }

        await transaction.insert(sessionsTable).values({
            tokenHash: hashToken(token),
            userId,
            expiresAt
        });
    });

    response.cookie(cookieName, token, {
        ...cookieOptions,
        maxAge: sessionDuration
    });
}

export async function getSessionUser(request) {
    const tokenHash = readSessionHash(request);

    if (!tokenHash) {
        return null;
    }

    const [user] = await db.select({
        id: usersTable.id,
        email: usersTable.email
    })
        .from(sessionsTable)
        .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
        .where(and(
            eq(sessionsTable.tokenHash, tokenHash),
            gt(sessionsTable.expiresAt, new Date())
        ))
        .limit(1);

    return user ?? null;
}

export async function endSession(request, response) {
    const tokenHash = readSessionHash(request);

    if (tokenHash) {
        await db.delete(sessionsTable)
            .where(eq(sessionsTable.tokenHash, tokenHash));
    }

    response.clearCookie(cookieName, cookieOptions);
}