const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthPattern = todayStr.substring(0, 7) + '%';
    const yearPattern = todayStr.substring(0, 4) + '%';

    // 1. Estadísticas de Consumo de API
    const callsToday = db.prepare('SELECT SUM(calls) as total FROM api_consumption WHERE date = ?').get(todayStr)?.total || 0;
    const callsMonth = db.prepare('SELECT SUM(calls) as total FROM api_consumption WHERE date LIKE ?').get(monthPattern)?.total || 0;
    const callsYear = db.prepare('SELECT SUM(calls) as total FROM api_consumption WHERE date LIKE ?').get(yearPattern)?.total || 0;

    const apiLogs = db.prepare(`
      SELECT date, type, calls 
      FROM api_consumption 
      ORDER BY date DESC, calls DESC 
      LIMIT 15
    `).all();

    // 2. Estadísticas de Visualización
    const totalShows = db.prepare('SELECT COUNT(*) as count FROM series').get().count;
    
    const episodesStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN watched = 1 THEN 1 ELSE 0 END) as watched
      FROM episodes
    `).get();

    const totalEpisodes = episodesStats.total || 0;
    const watchedEpisodes = episodesStats.watched || 0;
    
    // Estimación de tiempo invertido (aprox. 45 minutos por episodio)
    const totalHoursWatched = Math.round((watchedEpisodes * 45) / 60);

    // Calcular cuántas series están completamente vistas
    const completedShowsCount = db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT s.id
        FROM series s
        JOIN episodes e ON s.id = e.series_id
        GROUP BY s.id
        HAVING COUNT(e.id) = SUM(CASE WHEN e.watched = 1 THEN 1 ELSE 0 END)
           AND COUNT(e.id) > 0
      )
    `).get().count;

    // Calcular cuántas series están abandonadas (terminadas y no vistas al 100%)
    const abandonedShowsCount = db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT s.id
        FROM series s
        JOIN episodes e ON s.id = e.series_id
        WHERE LOWER(s.status) = 'ended'
        GROUP BY s.id
        HAVING SUM(CASE WHEN e.watched = 1 THEN 1 ELSE 0 END) < COUNT(e.id)
           AND COUNT(e.id) > 0
      )
    `).get().count;

    // 3. Estadísticas Avanzadas para Gráficos
    // Emisión vs Terminada
    const statusStats = db.prepare(`
      SELECT 
        SUM(CASE WHEN LOWER(status) = 'continuing' THEN 1 ELSE 0 END) as continuing,
        SUM(CASE WHEN LOWER(status) = 'ended' THEN 1 ELSE 0 END) as ended,
        SUM(CASE WHEN LOWER(status) NOT IN ('continuing', 'ended') OR status IS NULL THEN 1 ELSE 0 END) as other
      FROM series
    `).get() || { continuing: 0, ended: 0, other: 0 };

    // Distribución de calificaciones (1 a 5 estrellas)
    const ratingsDistribution = db.prepare(`
      SELECT 
        CAST(ROUND(rating) AS INTEGER) as stars,
        COUNT(*) as count
      FROM season_ratings
      WHERE rating > 0
      GROUP BY stars
      ORDER BY stars ASC
    `).all();

    const ratingsDist = [0, 0, 0, 0, 0];
    ratingsDistribution.forEach(row => {
      const idx = Math.min(Math.max(row.stars - 1, 0), 4);
      ratingsDist[idx] = row.count;
    });

    res.render('stats', {
      title: 'Estadísticas de Consumo y Visualización',
      activePage: 'stats',
      apiStats: {
        today: callsToday,
        month: callsMonth,
        year: callsYear,
        limit: 50000,
        percentageUsed: ((callsYear / 50000) * 100).toFixed(2)
      },
      apiLogs,
      userStats: {
        totalShows,
        totalEpisodes,
        watchedEpisodes,
        totalHoursWatched,
        completedShowsCount,
        abandonedShowsCount
      },
      advancedStats: {
        status: statusStats,
        ratingsDistribution: ratingsDist
      }
    });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    res.status(500).render('error', {
      title: 'Error de Servidor',
      message: 'No se pudieron recuperar las estadísticas en este momento.'
    });
  }
});

// Ruta para Exportar la Biblioteca (Backup)
router.get('/backup/exportar', (req, res) => {
  try {
    const series = db.prepare('SELECT * FROM series').all();
    const ratings = db.prepare('SELECT * FROM season_ratings').all();
    const episodes = db.prepare('SELECT * FROM episodes').all();

    const backupData = {
      version: '1.11.0',
      exportDate: new Date().toISOString(),
      series,
      ratings,
      episodes
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=showtracker-backup.json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Error al exportar backup:', error);
    res.status(500).json({ error: 'No se pudo generar la copia de seguridad.' });
  }
});

// Ruta para Importar la Biblioteca (Backup)
router.post('/backup/importar', (req, res) => {
  const { series, ratings, episodes } = req.body;

  if (!series || !ratings || !episodes) {
    return res.status(400).json({ success: false, error: 'Datos de copia de seguridad inválidos o incompletos.' });
  }

  try {
    const importTransaction = db.transaction(() => {
      const insertSeries = db.prepare(`
        INSERT OR REPLACE INTO series (id, name, slug, image, background, status, overview, score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of series) {
        insertSeries.run(s.id, s.name, s.slug, s.image, s.background, s.status, s.overview, s.score);
      }

      const insertRating = db.prepare(`
        INSERT OR REPLACE INTO season_ratings (series_id, season_number, rating)
        VALUES (?, ?, ?)
      `);
      for (const r of ratings) {
        insertRating.run(r.series_id, r.season_number, r.rating);
      }

      const insertEpisode = db.prepare(`
        INSERT OR REPLACE INTO episodes (id, series_id, name, season_number, episode_number, air_date, overview, watched)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const ep of episodes) {
        insertEpisode.run(
          ep.id,
          ep.series_id,
          ep.name,
          ep.season_number,
          ep.episode_number,
          ep.air_date,
          ep.overview,
          ep.watched
        );
      }
    });

    importTransaction();
    res.json({ success: true });
  } catch (error) {
    console.error('Error al importar backup:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
