# 📺 ShowTracker

Aplicación web premium para el seguimiento de tus series de televisión preferidas, integrada con la API de **TheTVDB v4**, almacenamiento en base de datos local **SQLite** y descarga automatizada de carátulas y fondos de pantalla.

---

## 🚀 Características Principales

*   **Buscador Integrado:** Conexión directa con la API de **TheTVDB v4** para buscar cualquier serie de televisión.
*   **Gestión en Caché Local:** Descarga y almacenamiento de metadatos (descripción, calificación, estado) y episodios de forma local para evitar sobrepasar los límites de cuota de la API.
*   **Almacenamiento Estructurado de Artworks:** Descarga automática de carátulas (posters) e imágenes de fondo (backgrounds) en directorios locales (`public/img/posters/` y `public/img/backgrounds/`).
*   **Elenco Principal (Cast):** Almacenamiento y descarga de fotos de los actores principales de cada serie en el directorio local `public/img/cast/` (máximo de 12 por serie) y visualización interactiva en una cuadrícula de 8 columnas con retratos circulares.
*   **Marcar Serie Completa:** Botón interactivo en el detalle de la serie que permite marcar o desmarcar todos los episodios como vistos de forma simultánea mediante peticiones AJAX fluidas.
*   **Galería Interactiva y Zoom:** Detalle de serie con carrusel autodecorativo de backgrounds y catálogo de posters alternativos con función de zoom (apertura en pestaña nueva al hacer clic) y controles reposicionados para una mejor legibilidad.
*   **Dashboard Optimizado:** Tarjetas de series un 20% más compactas (grilla de 5 columnas en resoluciones grandes) y ordenadas alfabéticamente de forma predeterminada.
*   **Estadísticas de Consumo de API:** Control detallado de cuota de la API (límite anual de 50.000 llamadas) y contador del tiempo total de visualización de episodios del usuario.
*   **Interfaz Premium Autoadaptativa:** Diseñada con **Bootstrap 5.3**, glassmorphism y soporte de cambio de tema claro y oscuro (☀️ / 🌙) con persistencia local (`localStorage`) y transiciones fluidas.
*   **Traducción Inteligente:** Priorización de idioma español (`spa`) para la metadata mediante rutas específicas de traducción con fallback automático a inglés (`eng`) en caso de no encontrarse traducción disponible.

---

## ⚙️ Tecnologías Utilizadas

*   **Entorno:** Node.js
*   **Servidor Web:** Express.js
*   **Motor de Plantillas:** EJS
*   **Estilos:** Bootstrap 5.3 (Modo Oscuro nativo por defecto) + Extensión de Colores Local
*   **Base de Datos:** SQLite (mediante `better-sqlite3` síncrono)
*   **Peticiones HTTP:** Axios

---

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio** o situarte en el directorio del proyecto.
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:
    ```env
    PORT=3000
    DATABASE_URL=db/showtracker.db
    TVDB_API_KEY=tu_api_key_aqui
    ```
4.  **Inicializar la Base de Datos:**
    ```bash
    node db/init.js
    ```
5.  **Iniciar Servidor en Desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

---

## 📂 Estructura del Proyecto

```text
├── app.js               # Entrada principal de la aplicación
├── package.json         # Dependencias y scripts del proyecto
├── .env                 # Variables de entorno (excluido de git)
├── .gitignore           # Archivos omitidos en el control de versiones
├── db/
│   ├── connection.js    # Conexión síncrona a SQLite
│   ├── init.js          # Creación inicial de tablas e índices
│   └── showtracker.db   # Archivo físico de la DB (excluido de git)
├── routes/
│   ├── index.js         # Ruta del panel principal
│   ├── series.js        # Rutas de búsqueda y seguimiento de series
│   ├── episodes.js      # Rutas API para alternar visto de episodios
│   └── stats.js         # Rutas de consumo y estadísticas
├── services/
│   ├── tvdb.js          # Cliente de la API de TheTVDB v4 y traducción
│   └── downloader.js    # Utilidad de descarga de imágenes local
├── public/
│   ├── css/
│   │   └── bootstrap-color-extension.css # CSS local adicional
│   ├── js/
│   │   └── theme.js     # Script del switch de tema claro/oscuro
│   └── img/             # Directorio de posters, backgrounds y placeholders
└── views/
    ├── index.ejs        # Dashboard principal
    ├── search.ejs       # Buscador de series
    ├── show.ejs         # Detalle interactivo de la serie y episodios
    ├── stats.ejs        # Vista de métricas y uso
    ├── error.ejs        # Plantilla de errores comunes
    └── partials/
        ├── header.ejs   # Encabezado modular y barra de navegación
        └── footer.ejs   # Pie de página modular
```

---

## 👤 Autor

*   **Juan Gabriel Maioli**
