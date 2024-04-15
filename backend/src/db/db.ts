import { Database } from 'sqlite3';

const { existsSync } = require('node:fs');
const sqlite3 = require('sqlite3').verbose();

const filepath = 'user_wallet.db';

function createDbConnection() {
  if (existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  }
  const db = new sqlite3.Database(filepath, (err: any) => {
    if (err) {
      return console.error(err.message);
    }
  });

  console.log('Database created');

  createUserTable(db);
  createFaucetTable(db);

  return db;
}

function createUserTable(db: Database) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users
  (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL,
    address       TEXT NOT NULL,
    password      TEXT NOT NULL,
    walletId      TEXT NOT NULL,
    algoBalance   INTEGER NOT NULL,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT NOT NULL
  );
`);

  console.log('Users Table created');
}

function createFaucetTable(db: Database) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS faucets
  (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    amount            INTEGER NOT NULL,
    address           TEXT NOT NULL,
    createdAt         TEXT NOT NULL
  );
`);

  console.log('Faucets Table created');
}

export const db = createDbConnection();
