require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { initDb } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar la base de datos al arrancar
initDb();

// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Importar rutas
const indexRoutes = require('./routes/index');
const seriesRoutes = require('./routes/series');
const episodesRoutes = require('./routes/episodes');
const statsRoutes = require('./routes/stats');

app.use('/', indexRoutes);
app.use('/series', seriesRoutes);
app.use('/episodes', episodesRoutes);
app.use('/stats', statsRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', { 
    title: '404 - No Encontrado', 
    message: 'La página que buscás no existe.' 
  });
});

let sslKeyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'ssl', 'key.pem');
let sslCertPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'ssl', 'cert.pem');

// Si no existen las rutas por defecto, buscar dinámicamente cualquier archivo .key y .crt/.pem en el directorio ssl
if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
  const sslDir = path.join(__dirname, 'ssl');
  if (fs.existsSync(sslDir)) {
    try {
      const files = fs.readdirSync(sslDir);
      const keyFile = files.find(f => f.endsWith('.key') || f === 'key.pem');
      const certFile = files.find(f => (f.endsWith('.crt') || f.endsWith('.pem')) && f !== keyFile);
      if (keyFile && certFile) {
        sslKeyPath = path.join(sslDir, keyFile);
        sslCertPath = path.join(sslDir, certFile);
      }
    } catch (e) {
      console.warn('No se pudo escanear el directorio ssl:', e.message);
    }
  }
}

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  try {
    const options = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath)
    };
    https.createServer(options, app).listen(PORT, () => {
      console.log(`Servidor seguro HTTPS iniciado en https://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar el servidor HTTPS:', error.message);
    process.exit(1);
  }
} else {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}
