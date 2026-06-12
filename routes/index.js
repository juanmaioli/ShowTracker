const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Ruta de inicio
router.get('/', (req, res) => {
  try {
    // Obtener series con su progreso de episodios
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.image, 
        s.status,
        s.score,
        COUNT(e.id) as total_episodes,
        SUM(CASE WHEN e.watched = 1 THEN 1 ELSE 0 END) as watched_episodes
      FROM series s
      LEFT JOIN episodes e ON s.id = e.series_id
      GROUP BY s.id
      ORDER BY s.added_at DESC
    `;
    const shows = db.prepare(query).all();

    // Calcular estadísticas resumidas
    let totalEpisodes = 0;
    let totalWatched = 0;
    shows.forEach(show => {
      totalEpisodes += show.total_episodes;
      totalWatched += show.watched_episodes;
    });

    const overallProgress = totalEpisodes > 0 ? Math.round((totalWatched / totalEpisodes) * 100) : 0;

    res.render('index', {
      title: 'Inicio',
      activePage: 'home',
      shows,
      stats: {
        totalShows: shows.length,
        totalEpisodes,
        totalWatched,
        overallProgress
      }
    });
  } catch (error) {
    console.error('Error al cargar la página de inicio:', error);
    res.status(500).render('error', {
      title: 'Error del Servidor',
      message: 'No se pudo recuperar la lista de series.'
    });
  }
});

module.exports = router;
