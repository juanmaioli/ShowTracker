# 📺 ShowTracker

Aplicación web premium para el seguimiento de tus series de televisión preferidas, integrada con la API de **TheTVDB v4**, almacenamiento en base de datos local **SQLite** y descarga automatizada de carátulas y fondos de pantalla.

---

## 🚀 Características Principales

*   **Buscador Integrado:** Conexión directa con la API de **TheTVDB v4** para buscar cualquier serie de televisión.
*   **Gestión en Caché Local:** Descarga y almacenamiento de metadatos (descripción, calificación, estado) y episodios de forma local para evitar sobrepasar los límites de cuota de la API.
*   **Almacenamiento Completo e Ilimitado de Artworks:** Descarga automática de **todos** los posters e imágenes de fondo (backgrounds) de la serie en directorios locales (`public/img/posters/` y `public/img/backgrounds/`), permitiendo poblar galerías de arte de la serie de manera offline e ilimitada.
*   **Elenco Principal (Cast):** Almacenamiento y descarga de fotos de los actores principales de cada serie en el directorio local `public/img/cast/` (máximo de 12 por serie) y visualización interactiva en una cuadrícula de 8 columnas con retratos circulares.
*   **Marcar Serie Completa:** Botón interactivo en el detalle de la serie que permite marcar o desmarcar todos los episodios como vistos de forma simultánea mediante peticiones AJAX fluidas.
*   **Calificación por Temporadas (0-5★):** Sistema interactivo que permite calificar de forma individual cada temporada de una serie utilizando un componente interactivo de estrellas. Las calificaciones se guardan en la tabla local `season_ratings`.
*   **Puntuación de Serie Basada en Promedio:** El score general de la serie se actualiza automáticamente calculando el promedio de las calificaciones de sus temporadas. Al importar nuevas series, el puntaje original de TVDB se escala de 0-10 a 0-5.
*   **Expansión Exclusiva por Flecha:** Los colapsos y aperturas del acordeón de episodios se disparan únicamente al clickear la flecha derecha dedicada en el encabezado, aislando los botones de completado y estrellas para evitar cierres no deseados.
*   **Filtro de Completadas con Persistencia:** Botón en el dashboard que oculta/muestra las series que están al 100% de su progreso. La preferencia se persiste en el navegador vía `localStorage`.
*   **Indicadores de Progreso y Completado:** La barra de progreso de cada tarjeta se tiñe de verde al alcanzar el 100%, y se superpone un triángulo verde distintivo de 64px en la esquina superior derecha del póster, desplazando la estrella de puntuación al extremo opuesto.
*   **Galería Interactiva y Zoom:** Detalle de serie con visor interactivo de backgrounds mediante una tira scrollable de miniaturas horizontales (con navegación complementaria por teclado usando las flechas izquierda/derecha y foco por scroll automático), catálogo de posters alternativos con función de zoom (apertura en pestaña nueva al hacer clic) y controles optimizados para una navegación fluida.
*   **Traducción y Estilizado de Emisiones:** Los estados de series se traducen a español ("En emisión" en color verde, "Terminada" en color rojo) de forma coherente en toda la aplicación.
*   **Insignias de Puntuación Violetas:** Las insignias de puntuación (score) fueron rediseñadas con color violeta (`purple`) para integrarse con la paleta de colores premium de la app.
*   **Dashboard Optimizado:** Tarjetas de series un 20% más compactas (grilla de 5 columnas en resoluciones grandes) y ordenadas alfabéticamente de forma predeterminada.
*   **Estadísticas de Consumo de API:** Control detallado de cuota de la API (límite anual de 50.000 llamadas) y contador del tiempo total de visualización de episodios del usuario.
*   **Mejoras de Accesibilidad (Alto Contraste):** Eliminación total de las clases de texto secundario/atenuado (`text-secondary` y `text-light` para textos descriptivos) en todas las vistas de la aplicación para garantizar la máxima legibilidad y contraste, facilitando el uso para personas con visión reducida.
*   **Enlaces Directos a TheTVDB:** Los identificadores de serie en la vista de detalle ahora enlazan de forma directa a sus páginas correspondientes en TheTVDB, abriéndose en pestañas nuevas.
*   **Año de Estreno en Títulos y Temporadas:** Visualización del año del primer episodio de la serie junto a su título principal (en dashboard, detalle y búsquedas) y el año de inicio de cada temporada al lado de su número en el desglose de episodios, permitiendo contextualizar temporalmente el contenido.
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
