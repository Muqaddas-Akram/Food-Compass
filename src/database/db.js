import * as SQLite from 'expo-sqlite';

let db = null;
let dbPromise = null;

export async function getDatabase() {
  if (db) return db;

  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('foodcompass.db');
      await initDatabase(database);
      db = database;
      return database;
    })();
  }

  try {
    return await dbPromise;
  } catch (error) {
    dbPromise = null;
    throw error;
  }
}

async function initDatabase(database) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      cookingTime INTEGER NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
      description TEXT,
      servings INTEGER DEFAULT 2,
      imageColor TEXT DEFAULT '#D9A44D'
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      isRequired INTEGER NOT NULL DEFAULT 1,
      alternatives TEXT,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId INTEGER NOT NULL,
      stepNumber INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      duration INTEGER,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      recipeId INTEGER PRIMARY KEY,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS step_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId INTEGER NOT NULL,
      stepNumber INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      UNIQUE(recipeId, stepNumber),
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);
}

export default getDatabase;
