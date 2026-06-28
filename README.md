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
*   **Buscador por Nombre en Tiempo Real:** Caja de búsqueda integrada en el dashboard de inicio para filtrar de forma dinámica las series por su nombre. Funciona de manera integrada y lógica con el resto de filtros (completadas, terminadas, abandonadas) y despliega un mensaje cuando no hay coincidencias.
*   **Dashboard Optimizado con Separadores y Abecedario:**
    *   **Navegación Alfabética Lateral:** Panel flotante responsivo que permite desplazarse mediante scroll suave hacia el grupo de series que inicien con la letra clickeada. Las letras se activan o desactivan dinámicamente según las series mostradas en tiempo real.
    *   **Separadores de Secciones:** Divisiones visuales por cada letra inicial (en grilla y en tabla). En la grilla, ocupan la mitad del ancho de una tarjeta de serie y usan saltos de línea inteligentes para evitar quedar solas al final de una fila.
    *   **Ordenamiento y Agrupación Normalizada:** Ordenamiento alfabético gestionado en el servidor que unifica letras con tildes (Á, É, Í, Ó, Ú) con sus respectivas letras base, manteniendo a la Ñ como una letra independiente según las normas del idioma español.
*   **Alternancia de Vistas (Grid / Lista):** Selector al lado del título que alterna entre la grilla de tarjetas y una lista compacta con póster circular, guardando la preferencia en `localStorage`.
*   **Copias de Seguridad (Backup & Restore):** Exportación completa de la biblioteca de series, calificaciones de temporadas y episodios a un archivo JSON local. Importación interactiva y atómica de datos que consolida tu biblioteca mediante transacciones en la base de datos SQLite.
*   **Estadísticas Avanzadas con Gráficos Interactivos:** Visualizaciones premium e interactivas integrando **Chart.js** para mostrar el estado de emisión de tus series (dona) y la distribución de calificaciones otorgadas a las temporadas (barras). Incluye una tarjeta de métrica en tiempo real para controlar las **Series Abandonadas** (finalizadas y no vistas al 100%).
*   **Filtro Exclusivo de Series Abandonadas:** Botón de filtrado en el dashboard que aísla de manera exclusiva y en un solo clic todas las series que han finalizado su emisión pero no fueron completadas al 100% de progreso, guardando la preferencia en `localStorage`.
*   **Sincronización Manual de Series:** Botón "Actualizar" en el detalle de la serie que vuelve a importar metadatos, elenco y artworks con TheTVDB v4, agregando nuevos episodios y preservando intacto el historial de vistos (`watched`).
*   **Estadísticas de Consumo de API:** Control detallado de cuota de la API (límite anual de 50.000 llamadas) y contador del tiempo total de visualización de episodios del usuario.
*   **Mejoras de Accesibilidad (Alto Contraste):** Eliminación total de las clases de texto secundario/atenuado (`text-secondary`, `text-light` y `text-white-50` para textos descriptivos) en todas las vistas de la aplicación para garantizar la máxima legibilidad y contraste, facilitando el uso para personas con visión reducida.
*   **Sección Header Hero Integrada:** Un banner superior con degradado violeta/azul oscuro (`linear-gradient`) que centraliza el título de la app y el menú de navegación principal con estilos fluidos y tipografía destacada.
*   **Controles Ultra-Compactos y Semánticos:** Botones del dashboard de inicio optimizados para mostrar únicamente emojis dinámicos con tooltips interactivos, brindando un panel de control limpio y minimalista.
*   **Enlaces Directos a TheTVDB:** Los identificadores de serie en la vista de detalle ahora enlazan de forma directa a sus páginas correspondientes en TheTVDB, abriéndose en pestañas nuevas.
*   **Integración con JustWatch Argentina:** Botón de acceso directo en la vista de detalles que permite buscar el título de la serie directamente en JustWatch en una pestaña nueva, ayudando al usuario a saber en qué plataformas está disponible el contenido.
*   **Año de Estreno en Títulos y Temporadas:** Visualización del año del primer episodio de la serie junto a su título principal (en dashboard, detalle y búsquedas) y el año de inicio de cada temporada al lado de su número en el desglose de episodios, permitiendo contextualizar temporalmente el contenido.
*   **Interfaz Premium Autoadaptativa:** Diseñada con **Bootstrap 5.3**, glassmorphism y soporte de cambio de tema claro y oscuro (☀️ / 🌙) con persistencia local (`localStorage`) y transiciones fluidas. Cuenta con adaptabilidad dinámica en tiempo real para gráficos de **Chart.js** mediante un observador de mutaciones (`MutationObserver`), asegurando legibilidad total de ejes y leyendas en ambos modos.
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
    > [!TIP]
    > **Base de Datos de Ejemplo:** El repositorio incluye el archivo `showtracker-example.db` con series precargadas. Para usarla como demostración inmediata sin configurar una API Key de TheTVDB, simplemente copiala al directorio `db/` y renombrala a `showtracker.db`.

4.  **Inicializar la Base de Datos:**
    Si decidiste no utilizar la base de datos de ejemplo, ejecutá:
    ```bash
    node db/init.js
    ```
5.  **Iniciar Servidor en Desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

---

## 🐳 Dockerización (Docker & Docker Compose)

La aplicación cuenta con soporte completo para Docker y Docker Compose, permitiendo levantar todo el entorno de forma automatizada y aislada.

### Requisitos previos
*   Tener instalado [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/).

### Pasos para iniciar el servicio
1.  **Configurar las variables de entorno:**
    Asegurate de tener el archivo `.env` configurado en la raíz del proyecto.
2.  *(Opcional)* **Certificados SSL:**
    Si querés correr la aplicación sobre **HTTPS**, creá una carpeta llamada `ssl` en la raíz del proyecto y colocá allí tu clave privada y certificado (ej. `apache.key` y `apache.crt` o `key.pem` y `cert.pem`). El contenedor los detectará y configurará HTTPS automáticamente.
3.  **Levantar el contenedor:**
    Ejecutá el siguiente comando en la raíz del proyecto:
    ```bash
    docker compose up -d --build
    ```

### Estructura de volúmenes persistentes
El archivo `compose.yml` define dos volúmenes nombrados para evitar la pérdida de datos:
*   `showtracker_db`: Mapeado a `/app/db` para persistir de forma segura la base de datos SQLite.
*   `showtracker_img`: Mapeado a `/app/public/img` para guardar de forma externa todas las imágenes de posters, actores y fondos de pantalla descargados dinámicamente.

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

## 🎨 Variantes del Software (Música & Películas)

Si estás interesado en adaptar este software para realizar el seguimiento de otros medios, consultá la guía detallada:
*   [VARIANTES.md](file:///home/juan/Documentos/Dev/Apps/ShowTracker/VARIANTES.md): Contiene los esquemas de base de datos SQLite recomendados, integraciones de APIs (TMDB y Spotify/MusicBrainz) y adaptaciones de gráficos para música y películas.

---

## 👤 Autor

*   **Juan Gabriel Maioli**
