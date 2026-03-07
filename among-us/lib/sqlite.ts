import Database from 'better-sqlite3';

// Cached connection for development
// @ts-expect-error - sqlite is not defined on global by default
let cachedDb: ReturnType<typeof Database> | null = global.sqlite || null;

export function openDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = new Database('./database.sqlite');
  
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    db.exec("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0");
  } catch(e) { /* Column already exists */ }
  
  try {
    db.exec("ALTER TABLE users ADD COLUMN rank TEXT DEFAULT 'Recruit'");
  } catch(e) { /* Column already exists */ }

  // @ts-expect-error - sqlite is not defined on global by default
  global.sqlite = db;
  cachedDb = db;

  return db;
}
