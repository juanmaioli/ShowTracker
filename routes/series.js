const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { searchSeries, getSeriesExtended } = require('../services/tvdb');
const { downloadSeriesImage } = require('../services/downloader');

// Helper para extraer campos traducidos priorizando Español, luego Inglés
function getLocalized(obj, fieldName, defaultValue = '') {
  if (!obj) return defaultValue;

  // 1. Si existe translations como array
  if (Array.isArray(obj.translations)) {
    const spa = obj.translations.find(t => t.language === 'spa' || t.language === 'es');
    if (spa && spa[fieldName]) return spa[fieldName];

    const eng = obj.translations.find(t => t.language === 'eng' || t.language === 'en');
    if (eng && eng[fieldName]) return eng[fieldName];
  }

  // 2. Si existe translations como objeto mapeado
  if (obj.translations && typeof obj.translations === 'object') {
    const spa = obj.translations.spa || obj.translations.es;
    if (spa && spa[fieldName]) return spa[fieldName];

    const eng = obj.translations.eng || obj.translations.en;
    if (eng && eng[fieldName]) return eng[fieldName];
  }

  // 3. Fallback a propiedades locales o traducciones directas
  const localVal = obj[fieldName];
  if (localVal) return localVal;

  // 4. Fallback a traductores específicos de TVDB (ej: nameTranslations)
  const translationsField = obj[`${fieldName}Translations` || `${fieldName}Translations` /* fallback a translations */];
  if (translationsField) {
    if (translationsField.spa || translationsField.es) return translationsField.spa || translationsField.es;
    if (translationsField.eng || translationsField.en) return translationsField.eng || translationsField.en;
  }

  return defaultValue;
}

// Vista de Búsqueda
router.get('/buscar', async (req, res) => {
  const query = req.query.q;
  let results = [];
  let errorMsg = null;

  if (query) {
    try {
      results = await searchSeries(query);
      
      // Marcar cuáles de los resultados ya están seguidos localmente
      const followedIds = db.prepare('SELECT id FROM series').all().map(s => s.id);
      results = results.map(show => {
        // En TheTVDB v4 search, el ID viene a menudo en show.tvdb_id o show.id. Dependiendo del tipo, lo normal es show.tvdb_id o show.id
        const tvdbId = parseInt(show.tvdb_id || show.id);
        return {
          ...show,
          tvdbId,
          isFollowed: followedIds.includes(tvdbId)
        };
      });
    } catch (error) {
      console.error('Error al buscar series:', error);
      errorMsg = 'Ocurrió un error al buscar en TheTVDB. Verificá tu API Key o conexión.';
    }
  }

  res.render('search', {
    title: 'Buscar Series',
    activePage: 'search',
    query: query || '',
    results,
    errorMsg
  });
});

// Detalle de Serie Seguidamente Local
router.get('/:id', (req, res) => {
  const showId = parseInt(req.params.id);

  try {
    const show = db.prepare('SELECT * FROM series WHERE id = ?').get(showId);
    if (!show) {
      return res.status(404).render('error', {
        title: 'Serie no encontrada',
        message: 'No estás siguiendo esta serie en ShowTracker.'
      });
    }

    const episodes = db.prepare(`
      SELECT * FROM episodes 
      WHERE series_id = ? 
      ORDER BY season_number ASC, episode_number ASC
    `).all(showId);

    // Agrupar episodios por temporada
    const seasons = {};
    episodes.forEach(ep => {
      // Omitir temporada 0 si son especiales (opcional, pero la dejaremos visible como Especiales)
      const seasonName = ep.season_number === 0 ? 'Especiales' : `Temporada ${ep.season_number}`;
      if (!seasons[ep.season_number]) {
        seasons[ep.season_number] = {
          number: ep.season_number,
          name: seasonName,
          episodes: []
        };
      }
      seasons[ep.season_number].episodes.push(ep);
    });

    // Calcular progreso
    const totalEpisodes = episodes.length;
    const watchedEpisodes = episodes.filter(e => e.watched === 1).length;
    const progressPercentage = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;

    // Obtener artworks de la serie
    const artworks = db.prepare('SELECT * FROM artworks WHERE series_id = ?').all(showId);
    const showPosters = artworks.filter(art => art.type === 'poster').map(a => a.image);
    const showBackgrounds = artworks.filter(art => art.type === 'background').map(a => a.image);

    // Obtener elenco de la serie
    const cast = db.prepare('SELECT * FROM series_cast WHERE series_id = ? ORDER BY sort_order ASC').all(showId);

    // Obtener calificaciones de las temporadas
    const ratings = db.prepare('SELECT season_number, rating FROM season_ratings WHERE series_id = ?').all(showId);
    const ratingsMap = {};
    ratings.forEach(r => {
      ratingsMap[r.season_number] = r.rating;
    });

    // Agregar la calificación a cada temporada
    const sortedSeasons = Object.values(seasons).sort((a, b) => a.number - b.number).map(season => {
      return {
        ...season,
        rating: ratingsMap[season.number] || 0
      };
    });

    res.render('show', {
      title: show.name,
      activePage: 'home',
      show,
      seasons: sortedSeasons,
      progress: {
        total: totalEpisodes,
        watched: watchedEpisodes,
        percentage: progressPercentage
      },
      artworks: {
        posters: showPosters,
        backgrounds: showBackgrounds
      },
      cast
    });
  } catch (error) {
    console.error('Error al cargar detalle de serie:', error);
    res.status(500).render('error', {
      title: 'Error de Servidor',
      message: 'No se pudo cargar la información de la serie.'
    });
  }
});

// Comenzar a seguir una serie (Agregar a DB local y descargar metadata/imágenes)
router.post('/seguir', async (req, res) => {
  const { tvdbId } = req.body;
  if (!tvdbId) {
    return res.status(400).render('error', { title: 'Parámetro inválido', message: 'Falta el ID de la serie.' });
  }

  const id = parseInt(tvdbId);

  try {
    // Verificar si ya se sigue
    const existing = db.prepare('SELECT id FROM series WHERE id = ?').get(id);
    if (existing) {
      return res.redirect(`/series/${id}`);
    }

    // Buscar datos completos en TheTVDB
    const { series, episodes } = await getSeriesExtended(id);

    if (!series) {
      return res.status(404).render('error', { title: 'No encontrada', message: 'La serie no existe en TheTVDB.' });
    }

    // Descargar poster e imagen de fondo (background) localmente
    const localImagePath = await downloadSeriesImage(series.image || series.thumbnail, id, 'posters');
    
    // Buscar URL de background en artworks (Tipo 3 es Fanart / Background en TVDB)
    let bgUrl = null;
    if (series.artworks && Array.isArray(series.artworks)) {
      const bgArtwork = series.artworks.find(art => 
        art.type === 3 || 
        String(art.type).toLowerCase() === 'background' || 
        String(art.type).toLowerCase() === 'fanart'
      );
      if (bgArtwork) {
        bgUrl = bgArtwork.image || bgArtwork.thumbnail;
      }
    }
    
    const localBgPath = bgUrl ? await downloadSeriesImage(bgUrl, id, 'backgrounds') : null;

    // Guardar Serie en base de datos
    db.prepare(`
      INSERT INTO series (id, name, slug, image, background, status, overview, score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      getLocalized(series, 'name', 'Serie sin título'),
      series.slug || '',
      localImagePath,
      localBgPath,
      series.status?.name || 'Unknown',
      getLocalized(series, 'overview', 'Sin descripción disponible.'),
      series.score ? (series.score / 2) : 0
    );

    // Guardar TODOS los posters y backgrounds en la tabla artworks (máximo 15 de cada uno para optimizar recursos)
    if (series.artworks && Array.isArray(series.artworks)) {
      const insertArtwork = db.prepare(`
        INSERT INTO artworks (series_id, type, image)
        VALUES (?, ?, ?)
      `);

      // Descargar y guardar posters
      const posters = series.artworks.filter(art => 
        art.type === 2 || String(art.type).toLowerCase() === 'poster'
      ).slice(0, 15);

      for (let i = 0; i < posters.length; i++) {
        const art = posters[i];
        const artUrl = art.image || art.thumbnail;
        if (artUrl) {
          const filenameId = `${id}-poster-${art.id || i}`;
          const localArtPath = await downloadSeriesImage(artUrl, filenameId, 'posters');
          insertArtwork.run(id, 'poster', localArtPath);
        }
      }

      // Descargar y guardar backgrounds
      const backgrounds = series.artworks.filter(art => 
        art.type === 3 || 
        String(art.type).toLowerCase() === 'background' || 
        String(art.type).toLowerCase() === 'fanart'
      ).slice(0, 15);

      for (let i = 0; i < backgrounds.length; i++) {
        const art = backgrounds[i];
        const artUrl = art.image || art.thumbnail;
        if (artUrl) {
          const filenameId = `${id}-bg-${art.id || i}`;
          const localArtPath = await downloadSeriesImage(artUrl, filenameId, 'backgrounds');
          insertArtwork.run(id, 'background', localArtPath);
        }
      }
    }

    // Guardar el elenco (cast) en la tabla series_cast (máximo 12 personajes para optimizar)
    if (series.characters && Array.isArray(series.characters)) {
      const insertCast = db.prepare(`
        INSERT INTO series_cast (series_id, actor_name, character_name, image, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `);

      const characters = series.characters.slice(0, 12);

      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const actorName = char.personName || 'Actor Desconocido';
        const charName = char.name || 'Personaje Desconocido';
        const imgUrl = char.image || char.personImgURL;
        
        let localCastImgPath = null;
        if (imgUrl) {
          const filenameId = `${id}-actor-${char.id || i}`;
          localCastImgPath = await downloadSeriesImage(imgUrl, filenameId, 'cast');
        } else {
          localCastImgPath = '/img/cast-placeholder.svg';
        }

        insertCast.run(id, actorName, charName, localCastImgPath, char.sort || i);
      }
    }

    // Guardar Episodios en base de datos
    const insertEpisode = db.prepare(`
      INSERT OR REPLACE INTO episodes (id, series_id, name, season_number, episode_number, air_date, overview, watched)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    // TheTVDB v4 devuelve los episodios en un listado
    const insertMany = db.transaction((eps) => {
      for (const ep of eps) {
        // Asegurar que guardamos los números correctos
        if (ep.seasonNumber === undefined || ep.number === undefined) continue;

        insertEpisode.run(
          ep.id,
          id,
          getLocalized(ep, 'name', `Episodio ${ep.number}`),
          ep.seasonNumber,
          ep.number,
          ep.aired || null,
          getLocalized(ep, 'overview', 'Sin descripción disponible.')
        );
      }
    });

    insertMany(episodes);

    res.redirect(`/series/${id}`);
  } catch (error) {
    console.error('Error al agregar serie a seguimiento:', error);
    res.status(500).render('error', {
      title: 'Error de Sincronización',
      message: `No se pudo agregar la serie a seguimiento: ${error.message}`
    });
  }
});

// Eliminar serie del seguimiento
router.post('/eliminar', (req, res) => {
  const { seriesId } = req.body;
  if (!seriesId) {
    return res.status(400).render('error', { title: 'Parámetro inválido', message: 'Falta el ID de la serie.' });
  }

  const id = parseInt(seriesId);

  try {
    // Borrar serie (y episodios por ON DELETE CASCADE)
    db.prepare('DELETE FROM series WHERE id = ?').run(id);
    
    // Opcional: Podríamos borrar el archivo de imagen de disco, pero lo dejaremos para evitar complejidad en el MVP.
    
    res.redirect('/');
  } catch (error) {
    console.error('Error al eliminar serie:', error);
    res.status(500).render('error', {
      title: 'Error de Servidor',
      message: 'No se pudo eliminar la serie del seguimiento.'
    });
  }
});

// Calificar una temporada
router.post('/rate-season', (req, res) => {
  const { seriesId, seasonNumber, rating } = req.body;
  if (seriesId === undefined || seasonNumber === undefined || rating === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }

  const id = parseInt(seriesId);
  const seasonNum = parseInt(seasonNumber);
  const scoreVal = parseFloat(rating);

  if (isNaN(id) || isNaN(seasonNum) || isNaN(scoreVal) || scoreVal < 0 || scoreVal > 5) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  try {
    // 1. Guardar la calificación de la temporada
    db.prepare(`
      INSERT INTO season_ratings (series_id, season_number, rating)
      VALUES (?, ?, ?)
      ON CONFLICT(series_id, season_number) DO UPDATE SET rating = excluded.rating
    `).run(id, seasonNum, scoreVal);

    // 2. Calcular el promedio de las calificaciones de las temporadas para esta serie
    const avgRow = db.prepare(`
      SELECT AVG(rating) as average FROM season_ratings WHERE series_id = ?
    `).get(id);

    const averageRating = avgRow.average || 0;

    // 3. Actualizar la calificación de la serie
    db.prepare('UPDATE series SET score = ? WHERE id = ?').run(averageRating, id);

    res.json({
      success: true,
      averageRating: averageRating.toFixed(1)
    });
  } catch (error) {
    console.error('Error al calificar la temporada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

