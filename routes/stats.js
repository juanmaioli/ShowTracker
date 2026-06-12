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
    // Una serie está completa si total_episodes > 0 y total_episodes == watched_episodes
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
        completedShowsCount
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

module.exports = router;
