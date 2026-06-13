const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DATABASE_URL || 'db/showtracker.db');

// Asegurar que la base de datos se inicializa de forma síncrona
const db = new Database(dbPath, process.env.DB_VERBOSE === 'true' ? { verbose: console.log } : {});

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

module.exports = db;
