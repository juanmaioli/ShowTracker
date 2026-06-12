const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Descarga una imagen desde una URL externa y la guarda localmente en una subcarpeta si se especifica.
 * @param {string} url - URL de la imagen en TheTVDB
 * @param {string|number} seriesId - ID de la serie para nombrar el archivo
 * @param {string} subFolder - Subcarpeta opcional (ej: 'posters', 'backgrounds')
 * @returns {Promise<string>} Ruta relativa para usar en HTML (ej: /img/posters/361115.jpg)
 */
async function downloadSeriesImage(url, seriesId, subFolder = '') {
  if (!url) return '/img/placeholder.svg'; // Retornar placeholder por defecto si no hay URL

  try {
    const destDir = path.resolve(__dirname, '../public/img', subFolder);
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const filename = `${seriesId}${ext}`;
    const destPath = path.join(destDir, filename);

    // Asegurar que la carpeta existe
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const writer = fs.createWriteStream(destPath);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const relativeUrl = subFolder ? `/img/${subFolder}/${filename}` : `/img/${filename}`;
        resolve(relativeUrl);
      });
      writer.on('error', (err) => {
        console.error('Error al guardar la imagen:', err);
        resolve('/img/placeholder.svg'); // Fallback en caso de error de escritura
      });
    });
  } catch (error) {
    console.error(`Error descargando imagen para serie ${seriesId} en subcarpeta ${subFolder}:`, error.message);
    return '/img/placeholder.svg'; // Fallback en caso de error de red
  }
}

module.exports = {
  downloadSeriesImage
};
