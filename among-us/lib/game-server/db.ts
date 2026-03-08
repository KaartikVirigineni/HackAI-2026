import Database from 'better-sqlite3';
import path from 'path';

let db: ReturnType<typeof Database> | null = null;

export function openDb() {
  if (db) return db;

  // Use the existing app database
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  db = new Database(dbPath);
  
  // Make sure the users table exists (from existing auth)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}
