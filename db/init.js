const db = require('./connection');

function initDb() {
  // Crear tabla settings para almacenar variables de la aplicación (como el token temporal de TVDB)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `).run();

  // Crear tabla series
  db.prepare(`
    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT,
      image TEXT,
      background TEXT,
      status TEXT,
      overview TEXT,
      score REAL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Crear tabla episodes
  db.prepare(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY,
      series_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      season_number INTEGER NOT NULL,
      episode_number INTEGER NOT NULL,
      air_date TEXT,
      overview TEXT,
      watched INTEGER DEFAULT 0,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    )
  `).run();

  // Crear tabla api_consumption
  db.prepare(`
    CREATE TABLE IF NOT EXISTS api_consumption (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      calls INTEGER DEFAULT 0,
      type TEXT NOT NULL
    )
  `).run();

  // Crear tabla artworks
  db.prepare(`
    CREATE TABLE IF NOT EXISTS artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      image TEXT NOT NULL,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    )
  `).run();

  // Crear tabla series_cast
  db.prepare(`
    CREATE TABLE IF NOT EXISTS series_cast (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL,
      actor_name TEXT NOT NULL,
      character_name TEXT,
      image TEXT,
      sort_order INTEGER,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    )
  `).run();

  // Crear tabla season_ratings
  db.prepare(`
    CREATE TABLE IF NOT EXISTS season_ratings (
      series_id INTEGER NOT NULL,
      season_number INTEGER NOT NULL,
      rating REAL NOT NULL,
      PRIMARY KEY (series_id, season_number),
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    )
  `).run();

  // Crear índices para optimizar búsquedas comunes
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_artworks_series ON artworks(series_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_series_cast_series ON series_cast(series_id)`).run();
  db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_api_consumption_date_type ON api_consumption(date, type)`).run();

  console.log('Base de datos inicializada correctamente.');
}

if (require.main === module) {
  initDb();
}

module.exports = { initDb };
