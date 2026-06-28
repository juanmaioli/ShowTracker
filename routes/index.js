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
        s.score as tvdb_score,
        COALESCE((SELECT AVG(rating) FROM season_ratings WHERE series_id = s.id), 0.0) as user_score,
        COUNT(e.id) as total_episodes,
        SUM(CASE WHEN e.watched = 1 THEN 1 ELSE 0 END) as watched_episodes,
        MIN(CASE WHEN e.season_number > 0 AND e.air_date IS NOT NULL AND e.air_date != '' THEN e.air_date ELSE NULL END) as first_air_date
      FROM series s
      LEFT JOIN episodes e ON s.id = e.series_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `;
    const shows = db.prepare(query).all();
    
    // Ordenar alfabéticamente ignorando acentos pero respetando la Ñ
    shows.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    // Calcular estadísticas resumidas
    let totalEpisodes = 0;
    let totalWatched = 0;
    shows.forEach(show => {
      totalEpisodes += show.total_episodes;
      totalWatched += show.watched_episodes;
      show.first_air_year = show.first_air_date ? show.first_air_date.split('-')[0] : null;
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
