const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Alternar estado visto/no visto de un episodio
router.post('/toggle-watched', (req, res) => {
  const { episodeId } = req.body;
  if (!episodeId) {
    return res.status(400).json({ error: 'Falta el ID del episodio' });
  }

  try {
    // Obtener estado actual
    const episode = db.prepare('SELECT watched, series_id FROM episodes WHERE id = ?').get(episodeId);
    if (!episode) {
      return res.status(404).json({ error: 'Episodio no encontrado' });
    }

    const newStatus = episode.watched === 1 ? 0 : 1;
    db.prepare('UPDATE episodes SET watched = ? WHERE id = ?').run(newStatus, episodeId);

    // Calcular el nuevo progreso de la serie
    const stats = db.prepare(`
      SELECT 
        COUNT(id) as total,
        SUM(CASE WHEN watched = 1 THEN 1 ELSE 0 END) as watched
      FROM episodes
      WHERE series_id = ?
    `).get(episode.series_id);

    res.json({
      success: true,
      watched: newStatus === 1,
      seriesProgress: {
        total: stats.total,
        watched: stats.watched || 0,
        percentage: stats.total > 0 ? Math.round(((stats.watched || 0) / stats.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de visto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Marcar toda una temporada como vista o no vista
router.post('/toggle-season', (req, res) => {
  const { seriesId, seasonNumber, watched } = req.body;
  if (seriesId === undefined || seasonNumber === undefined || watched === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }

  try {
    const watchedValue = watched ? 1 : 0;
    
    // Actualizar episodios de la temporada
    db.prepare('UPDATE episodes SET watched = ? WHERE series_id = ? AND season_number = ?')
      .run(watchedValue, seriesId, seasonNumber);

    // Calcular progreso general de la serie
    const stats = db.prepare(`
      SELECT 
        COUNT(id) as total,
        SUM(CASE WHEN watched = 1 THEN 1 ELSE 0 END) as watched
      FROM episodes
      WHERE series_id = ?
    `).get(seriesId);

    res.json({
      success: true,
      seriesProgress: {
        total: stats.total,
        watched: stats.watched || 0,
        percentage: stats.total > 0 ? Math.round(((stats.watched || 0) / stats.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de temporada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Marcar toda la serie como vista o no vista
router.post('/toggle-series', (req, res) => {
  const { seriesId, watched } = req.body;
  if (seriesId === undefined || watched === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }

  try {
    const id = parseInt(seriesId);
    const watchedValue = watched ? 1 : 0;
    
    // Actualizar todos los episodios de la serie
    db.prepare('UPDATE episodes SET watched = ? WHERE series_id = ?')
      .run(watchedValue, id);

    // Calcular progreso general de la serie
    const stats = db.prepare(`
      SELECT 
        COUNT(id) as total,
        SUM(CASE WHEN watched = 1 THEN 1 ELSE 0 END) as watched
      FROM episodes
      WHERE series_id = ?
    `).get(id);

    res.json({
      success: true,
      seriesProgress: {
        total: stats.total,
        watched: stats.watched || 0,
        percentage: stats.total > 0 ? Math.round(((stats.watched || 0) / stats.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de toda la serie:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
