const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/tasks.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance = null;

// Helper to provide a unified interface whether using better-sqlite3 or node:sqlite
function initializeDatabase() {
  let backend = 'better-sqlite3';
  let db;

  try {
    const Database = require('better-sqlite3');
    db = new Database(dbPath);
    // Enable WAL mode for better concurrency and performance
    db.pragma('journal_mode = WAL');
    console.log(`[Database] Connected to SQLite via better-sqlite3 at: ${dbPath}`);
  } catch (err) {
    console.warn('[Database] better-sqlite3 not available, attempting native node:sqlite fallback...', err.message);
    try {
      const { DatabaseSync } = require('node:sqlite');
      db = new DatabaseSync(dbPath);
      backend = 'node:sqlite';
      console.log(`[Database] Connected to SQLite via native node:sqlite at: ${dbPath}`);
    } catch (fallbackErr) {
      console.error('[Database] Failed to initialize SQLite database:', fallbackErr);
      throw fallbackErr;
    }
  }

  // Create table if not exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      dueDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `;

  if (backend === 'better-sqlite3') {
    db.exec(createTableQuery);

    // Seed initial data if empty
    const count = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    if (count === 0) {
      seedInitialTasksBetterSqlite(db);
    }

    dbInstance = {
      all: (sql, params = []) => db.prepare(sql).all(params),
      get: (sql, params = []) => db.prepare(sql).get(params),
      run: (sql, params = []) => {
        const info = db.prepare(sql).run(params);
        return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
      },
      close: () => db.close()
    };
  } else {
    // node:sqlite
    db.exec(createTableQuery);

    const count = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    if (count === 0) {
      seedInitialTasksNodeSqlite(db);
    }

    dbInstance = {
      all: (sql, params = []) => db.prepare(sql).all(...params),
      get: (sql, params = []) => db.prepare(sql).get(...params),
      run: (sql, params = []) => {
        const stmt = db.prepare(sql);
        const result = stmt.run(...params);
        return { lastInsertRowid: result.lastInsertRowid, changes: result.changes };
      },
      close: () => db.close()
    };
  }

  return dbInstance;
}

function getSeedData() {
  const now = new Date();
  const formatIso = (date) => date.toISOString();

  const d1 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const d2 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const d3 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const d4 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  return [
    {
      title: 'Design Full Stack Architecture & REST API',
      description: 'Define database schema, routes, controllers, and API contracts for CRUD operations.',
      status: 'completed',
      priority: 'high',
      dueDate: d4.toISOString().split('T')[0],
      createdAt: formatIso(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
      updatedAt: formatIso(now)
    },
    {
      title: 'Build Express Backend with SQLite',
      description: 'Implement CRUD endpoints with error handling, validation, and JSON responses.',
      status: 'completed',
      priority: 'high',
      dueDate: d1.toISOString().split('T')[0],
      createdAt: formatIso(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
      updatedAt: formatIso(now)
    },
    {
      title: 'Develop Responsive React Frontend UI',
      description: 'Create interactive forms for Adding, Viewing, Editing, and Deleting tasks with real-time updates.',
      status: 'in_progress',
      priority: 'high',
      dueDate: d2.toISOString().split('T')[0],
      createdAt: formatIso(now),
      updatedAt: formatIso(now)
    },
    {
      title: 'Add Search, Filter & Stats Dashboard',
      description: 'Allow users to filter tasks by status, priority, and search title/description.',
      status: 'in_progress',
      priority: 'medium',
      dueDate: d3.toISOString().split('T')[0],
      createdAt: formatIso(now),
      updatedAt: formatIso(now)
    },
    {
      title: 'Prepare Project Documentation & Demo Video',
      description: 'Write comprehensive README with API documentation and run instructions for client delivery.',
      status: 'pending',
      priority: 'medium',
      dueDate: d3.toISOString().split('T')[0],
      createdAt: formatIso(now),
      updatedAt: formatIso(now)
    }
  ];
}

function seedInitialTasksBetterSqlite(db) {
  const insert = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, dueDate, createdAt, updatedAt)
    VALUES (@title, @description, @status, @priority, @dueDate, @createdAt, @updatedAt)
  `);

  const insertMany = db.transaction((tasks) => {
    for (const task of tasks) {
      insert.run(task);
    }
  });

  insertMany(getSeedData());
  console.log('[Database] Seeded 5 initial demo tasks successfully.');
}

function seedInitialTasksNodeSqlite(db) {
  const tasks = getSeedData();
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, dueDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of tasks) {
    stmt.run(t.title, t.description, t.status, t.priority, t.dueDate, t.createdAt, t.updatedAt);
  }
  console.log('[Database] Seeded 5 initial demo tasks successfully.');
}

function getDb() {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

module.exports = {
  getDb
};
