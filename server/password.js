import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const options = { N: 2 ** 15, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const dummyHash = `${"00".repeat(16)}:${"00".repeat(64)}`;

export async function hashPassword(password) {
    const salt = randomBytes(16);
    const hash = await scryptAsync(password, salt, 64, options);

    return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password, storedHash = dummyHash) {
    const [saltHex, hashHex] = storedHash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    const actualHash = await scryptAsync(password, salt, 64, options);

    return expectedHash.length === actualHash.length
        && timingSafeEqual(expectedHash, actualHash);
}