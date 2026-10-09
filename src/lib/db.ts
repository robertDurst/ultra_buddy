import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databasePath = resolve(process.env.DATABASE_PATH ?? "./data/ultra-buddy.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });

const globalDb = globalThis as unknown as { ultraBuddyDb?: Database.Database };
export const db = globalDb.ultraBuddyDb ?? new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");
if (process.env.NODE_ENV !== "production") globalDb.ultraBuddyDb = db;
