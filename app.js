require('dotenv').config();
const express = require('express');
const path = require('path');
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

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
