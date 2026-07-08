# API - Media (Text-Based CAPTCHA API)

Este proyecto consiste en el desarrollo de una API diseñada para funcionar principalmente como un sistema de **CAPTCHA basado en texto y reconocimiento cultural**. La API se encarga de servir escenas memorables, icónicas o ampliamente conocidas de series, películas y anime, donde cada escena cuenta con su respectivo subtítulo incrustado en la misma imagen. El propósito es validar la interacción humana mediante la verificación semántica o el contexto de los elementos visuales y textuales expuestos.

## 🚀 Características Principales

- **Filtro CAPTCHA No Convencional:** Reemplaza los captchas automáticos tradicionales por desafíos basados en el reconocimiento de escenas y subtítulos de la cultura pop.
- **Subtítulos Incrustados:** Cada recurso gráfico viene con texto integrado, permitiendo realizar dinámicas avanzadas de comparación o transcripción.
- **Estructura Extensible:** Base de datos estructurada con múltiples metadatos indexados (actores, personajes, marcas temporales exactas) para habilitar diversos tipos de validaciones automáticas.
- **Diseño Arquitectónico Limpio:** Pensado para estructurarse bajo el patrón arquitectónico Modelo-Vista-Controlador (MVC), facilitando la modularización, legibilidad y el mantenimiento a largo plazo.

## 📊 Diseño y Modelo de Datos (Persistencia)

La persistencia de datos almacena los registros de cada escena utilizando un mapeo relacional riguroso. Los campos que componen la base de datos son:

| Campo | Tipo de Datos | Descripción |
| :--- | :--- | :--- |
| `id` | `Integer` | Identificador único autoincremental de la escena (Primary Key). |
| `nombre` | `String` | Nombre oficial de la obra audiovisual (Serie, Película o Anime). |
| `imagenDeEscena` | `String` | Nombre o ruta del archivo de imagen con su respectiva extensión (ej. `.jpg`, `.png`, `.jpeg`). |
| `actor` | `String` | Nombre completo del actor o actriz de la vida real que interpreta la escena (si aplica). |
| `personaje` | `String` | Nombre del personaje de la ficción que aparece o interactúa en la escena. |
| `añoEscena` | `Integer` | Año de lanzamiento o producción original de la obra o escena correspondiente. |
| `minutoEscena` | `Double / Float` | Estampa de tiempo exacta (minuto y segundo decimal) en la que ocurre la escena dentro del metraje. |