import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const expoDb = openDatabaseSync("todos.db");
export const db = drizzle(expoDb, { schema });

export const initializeDb = () => {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      due_date INTEGER
    );
  `);

  try {
    // Migration for existing users: Add due_date if it doesn't exist
    expoDb.execSync("ALTER TABLE todos ADD COLUMN due_date INTEGER");
  } catch (e) {
    // Column likely exists, ignore
  }
};
