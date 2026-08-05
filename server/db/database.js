import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'watchstore.db');

let sqlDb = null;
let dbWrapper = null;
let dbReady = null;

class DatabaseWrapper {
  constructor(sqlDbInstance) {
    this._db = sqlDbInstance;
  }

  exec(sql) {
    try {
      this._db.run(sql);
    } catch(e) {
      // Handle multi-statement schemas
      const statements = sql.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        try { this._db.run(stmt.trim()); } catch(e2) {}
      }
    }
    this._save();
    return this;
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        self._db.run(sql, params);
        // Get last insert rowid BEFORE saving (save can reset it)
        let lastId = 0;
        try {
          const r = self._db.exec('SELECT last_insert_rowid() as id');
          if (r.length > 0 && r[0].values.length > 0) {
            lastId = Number(r[0].values[0][0]);
          }
        } catch(e) {}
        const changes = self._db.getRowsModified();
        self._save();
        return { lastInsertRowid: lastId, changes };
      },
      get(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          stmt.free();
          const row = {};
          cols.forEach((col, i) => { row[col] = vals[i]; });
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          const row = {};
          cols.forEach((col, i) => { row[col] = vals[i]; });
          results.push(row);
        }
        stmt.free();
        return results;
      }
    };
  }

  transaction(fn) {
    const self = this;
    return function(...args) {
      self._db.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        self._db.run('COMMIT');
        self._save();
        return result;
      } catch (e) {
        try { self._db.run('ROLLBACK'); } catch(rollbackErr) {}
        throw e;
      }
    };
  }

  pragma(str) {
    try { this._db.run(`PRAGMA ${str}`); } catch(e) {}
  }

  _save() {
    try {
      const data = this._db.export();
      const buffer = Buffer.from(data);
      writeFileSync(dbPath, buffer);
    } catch(e) {
      console.error('Save error:', e.message);
    }
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  dbWrapper = new DatabaseWrapper(sqlDb);

  // Initialize schema
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  const statements = schema.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      dbWrapper._db.run(stmt.trim());
    } catch(e) {
      // Table/index may already exist
    }
  }
  dbWrapper._save();

  return dbWrapper;
}

dbReady = initDatabase();

export default new Proxy({}, {
  get(target, prop) {
    if (prop === 'ready') return dbReady;
    if (prop === 'then') return undefined;
    return (...args) => {
      if (!dbWrapper) throw new Error('Database not initialized');
      return dbWrapper[prop](...args);
    };
  }
});

export { dbReady };
