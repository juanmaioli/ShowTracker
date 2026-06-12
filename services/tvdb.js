const axios = require('axios');
const db = require('../db/connection');

const BASE_URL = 'https://api4.thetvdb.com/v4';

// Registrar una llamada a la API en la base de datos
function registerApiCall(endpoint) {
  const today = new Date().toISOString().split('T')[0];
  try {
    db.prepare(`
      INSERT INTO api_consumption (date, calls, type)
      VALUES (?, 1, ?)
      ON CONFLICT(date, type) DO UPDATE SET calls = calls + 1
    `).run(today, endpoint);
  } catch (error) {
    console.error('Error registrando llamada de API:', error);
  }
}

// Obtener el token de settings o loguearse de nuevo
async function getToken() {
  // Intentar obtener token guardado
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('tvdb_token');
  if (row) {
    return row.value;
  }

  // Si no existe, iniciar sesión
  const apiKey = process.env.TVDB_API_KEY;
  if (!apiKey) {
    throw new Error('TVDB_API_KEY no está configurada en el archivo .env');
  }

  console.log('Obteniendo nuevo token de TheTVDB...');
  registerApiCall('/login');
  
  const response = await axios.post(`${BASE_URL}/login`, {
    apikey: apiKey
  });

  if (response.data && response.data.data && response.data.data.token) {
    const token = response.data.data.token;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('tvdb_token', token);
    return token;
  } else {
    throw new Error('Error al autenticar con TheTVDB: No se recibió token.');
  }
}

// Cliente Axios configurado con el token
async function getApiClient() {
  const token = await getToken();
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'spa'
    }
  });

  // Interceptor para manejar tokens expirados (401)
  client.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log('Token expirado o inválido. Renovando...');
        
        // Forzar renovación borrando el token viejo
        db.prepare('DELETE FROM settings WHERE key = ?').run('tvdb_token');
        const newToken = await getToken();
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return client(originalRequest);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// Buscar series por texto
async function searchSeries(query) {
  const client = await getApiClient();
  registerApiCall('/search');
  const response = await client.get('/search', {
    params: {
      q: query,
      type: 'series'
    }
  });
  return response.data.data || [];
}

// Obtener traducción de una serie en un idioma específico
async function getSeriesTranslation(id, lang) {
  const client = await getApiClient();
  registerApiCall(`/series/${id}/translations/${lang}`);
  try {
    const response = await client.get(`/series/${id}/translations/${lang}`);
    return response.data.data;
  } catch (error) {
    console.warn(`No se encontró traducción en ${lang} para la serie ${id}:`, error.message);
    return null;
  }
}

// Obtener episodios oficiales de una serie en un idioma específico
async function getSeriesEpisodes(id, lang) {
  const client = await getApiClient();
  registerApiCall(`/series/${id}/episodes/official/${lang}`);
  try {
    const response = await client.get(`/series/${id}/episodes/official/${lang}`);
    return response.data.data.episodes || [];
  } catch (error) {
    console.warn(`Error al obtener episodios oficiales en ${lang} para la serie ${id}:`, error.message);
    return null;
  }
}

// Obtener información extendida de una serie (incluye traducción y episodios localizados)
async function getSeriesExtended(id) {
  const client = await getApiClient();
  
  // 1. Obtener metadata extendida básica (artworks, status, etc.)
  registerApiCall(`/series/${id}/extended`);
  const response = await client.get(`/series/${id}/extended`);
  const seriesData = response.data.data;

  // 2. Intentar obtener traducción al Español, con fallback al Inglés
  let translation = await getSeriesTranslation(id, 'spa');
  if (!translation) {
    translation = await getSeriesTranslation(id, 'eng');
  }

  if (translation) {
    // Sobrescribir campos principales con la traducción encontrada
    seriesData.name = translation.name || seriesData.name;
    seriesData.overview = translation.overview || seriesData.overview;
  }

  // 3. Intentar obtener episodios oficiales en Español, con fallback al Inglés
  let episodesData = await getSeriesEpisodes(id, 'spa');
  if (!episodesData || episodesData.length === 0) {
    episodesData = await getSeriesEpisodes(id, 'eng');
  }
  if (!episodesData) {
    episodesData = [];
  }

  return {
    series: seriesData,
    episodes: episodesData
  };
}

module.exports = {
  searchSeries,
  getSeriesExtended,
  registerApiCall
};
