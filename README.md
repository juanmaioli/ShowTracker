# 📺 ShowTracker

Aplicación web premium para el seguimiento de tus series de televisión preferidas, integrada con la API de **TheTVDB v4**, almacenamiento en base de datos local **SQLite** y descarga automatizada de carátulas y fondos de pantalla.

---

## 🚀 Características Principales

*   **Buscador de Series Optimizado:** Conexión directa con la API de **TheTVDB v4** con un diseño de tarjetas de resultados más compacto (sin resúmenes redundantes) y con enlaces directos integrados en el título para abrir la serie correspondiente en TheTVDB en una nueva pestaña.
*   **Importación Paralela y Masiva (Cola Persistente):** Sistema interactivo que permite acumular múltiples series seleccionadas en una lista de descargas persistente en el navegador (`localStorage`) a través de diferentes búsquedas. El proceso de descarga e importación local de todas las series seleccionadas se realiza de forma secuencial y en segundo plano mediante AJAX, con una barra de progreso integrada no invasiva y redirección automatizada al finalizar.
*   **Gestión en Caché Local con Paginación Completa:** Descarga y almacenamiento de metadatos y episodios de forma local para evitar sobrepasar los límites de cuota de la API. Cuenta con soporte completo para la paginación de la API de TheTVDB v4, recuperando de forma recursiva y concatenando todas las páginas de episodios (límite de 500 por página) para series de gran tamaño (por ejemplo, *Los Simpson*, *One Piece*, etc.).
*   **Almacenamiento Completo de Artworks Optimizado por Lotes:** Descarga automática de **todos** los posters e imágenes de fondo (backgrounds) de la serie en directorios locales (`public/img/posters/` y `public/img/backgrounds/`). El proceso de descarga se paraleliza en Express mediante lotes (chunks) de 8 descargas simultáneas en red, lo cual previene timeouts de HTTP de red y aumenta la velocidad de importación en más de un 80%.
*   **Elenco Principal (Cast) Concurrente:** Almacenamiento y descarga de fotos de los actores principales de cada serie en el directorio local `public/img/cast/` (máximo de 12 por serie) paralelizado en red, visualizándose de manera interactiva en una cuadrícula de 8 columnas con retratos circulares.
*   **Marcar Serie Completa:** Botón interactivo en el detalle de la serie que permite marcar o desmarcar todos los episodios como vistos de forma simultánea mediante peticiones AJAX fluidas.
*   **Calificación por Temporadas (0-5★):** Sistema interactivo que permite calificar de forma individual cada temporada de una serie utilizando un componente interactivo de estrellas. Las calificaciones se guardan en la tabla local `season_ratings`.
*   **Puntuación de Serie Basada en Promedio:** El score general de la serie se actualiza automáticamente calculando el promedio de las calificaciones de sus temporadas. Al importar nuevas series, el puntaje original de TVDB se escala de 0-10 a 0-5.
*   **Expansión Exclusiva por Flecha:** Los colapsos y aperturas del acordeón de episodios se disparan únicamente al clickear la flecha derecha dedicada en el encabezado, aislando los botones de completado y estrellas para evitar cierres no deseados.
*   **Filtros Combinados en Dashboard (Completadas / Terminadas):** Botones interactivos en el dashboard que permiten ocultar/mostrar series completadas al 100% de progreso y series que se encuentran finalizadas ("Terminada" / "Ended"). Estos filtros conviven de manera lógica y sus preferencias se persisten en el navegador a través de `localStorage`.
*   **Exclusión de Especiales (Temporada 0):** Filtro automático en el motor de importación y actualización de series que omite la descarga e inserción de episodios especiales (temporada 0), almacenando y actualizando únicamente las temporadas oficiales y regulares.
*   **Indicadores de Progreso y Calificación en Esquinas (Inclinados):**
    *   **Calificación Propia Local:** Un triángulo púrpura decorativo de 56px en la esquina superior izquierda que muestra la calificación promedio dada por el usuario (0-5★) inclinada simétricamente a -45 grados, reemplazando el score remoto de TheTVDB.
    *   **Porcentaje de Completado:** Al alcanzar el 100% de progreso, la barra de visualización se tiñe de verde y se superpone un triángulo verde distintivo de 64px en la esquina superior derecha con el texto "100%" inclinado a 45 grados.
*   **Galería Interactiva y Zoom:** Detalle de serie con visor interactivo de backgrounds mediante una tira scrollable de miniaturas horizontales (con navegación complementaria por teclado usando las flechas izquierda/derecha y foco por scroll automático), catálogo de posters alternativos con función de zoom (apertura en pestaña nueva al hacer clic) y controles optimizados para una navegación fluida.
*   **Traducción y Estilizado de Emisiones:** Los estados de series se traducen a español ("En emisión" en color verde, "Terminada" en color rojo) de forma coherente en toda la aplicación.
*   **Insignias de Puntuación Violetas:** Las insignias de puntuación (score) fueron rediseñadas con color violeta (`purple`) para integrarse con la paleta de colores premium de la app.
*   **Dashboard Optimizado:** Grilla de 6 columnas en resoluciones de pantalla grandes ordenadas alfabéticamente.
*   **Alternancia de Vistas (Grid / Lista):** Selector al lado del título que alterna entre la grilla de tarjetas y una lista compacta con póster circular, guardando la preferencia en `localStorage`.
*   **Sincronización Manual de Series:** Botón "Actualizar" en el detalle de la serie que vuelve a importar metadatos, elenco y artworks con TheTVDB v4, agregando nuevos episodios y preservando intacto el historial de vistos (`watched`).
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
