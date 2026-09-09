-- =============================================================================
-- BASE DE DATOS: API-Media (Text-Based CAPTCHA API)
-- Diseñado para MySQL / MariaDB (XAMPP / phpMyAdmin)
-- =============================================================================

-- 1. Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS `api_media_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `api_media_db`;

-- Desactivar temporalmente revisión de claves foráneas para permitir borrado limpio
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `desafios_captcha`;
DROP TABLE IF EXISTS `escenas`;
DROP TABLE IF EXISTS `personajes`;
DROP TABLE IF EXISTS `actores`;
DROP TABLE IF EXISTS `obras`;
DROP TABLE IF EXISTS `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 2. Estructura de Tablas
-- =============================================================================

-- Tabla de Usuarios
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE,
  `contrasena` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin', 'cliente') DEFAULT 'cliente',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Obras Audiovisuales (Películas, Series, Anime)
CREATE TABLE `obras` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(150) NOT NULL,
  `tipo` ENUM('pelicula', 'serie', 'anime') NOT NULL,
  `anio_estreno` INT NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Actores reales
CREATE TABLE `actores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_completo` VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- Tabla de Personajes de ficción
CREATE TABLE `personajes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `obra_id` INT NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  CONSTRAINT `fk_personajes_obra`
    FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla de Escenas (Elemento central del CAPTCHA)
CREATE TABLE `escenas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `obra_id` INT NOT NULL,
  `actor_id` INT NULL,
  `personaje_id` INT NULL,
  `imagen_de_escena` VARCHAR(255) NOT NULL COMMENT 'Ruta o nombre del archivo de imagen con subtítulo integrado',
  `subtitulo_texto` TEXT NOT NULL COMMENT 'Texto transcripto del subtítulo para validación semántica',
  `minuto_escena` DECIMAL(6, 2) NOT NULL COMMENT 'Estampa de tiempo exacta (minuto y segundo decimal, ej. 28.45)',
  `dificultad` ENUM('facil', 'medio', 'dificil') DEFAULT 'medio',
  `activo` TINYINT(1) DEFAULT 1,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_escenas_obra`
    FOREIGN KEY (`obra_id`) REFERENCES `obras` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_escenas_actor`
    FOREIGN KEY (`actor_id`) REFERENCES `actores` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_escenas_personaje`
    FOREIGN KEY (`personaje_id`) REFERENCES `personajes` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla de Desafíos CAPTCHA (Gestión de sesiones efímeras de verificación)
CREATE TABLE `desafios_captcha` (
  `id` VARCHAR(36) PRIMARY KEY COMMENT 'UUID único del desafío',
  `token` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Token enviado al frontend para validar el reto',
  `escena_id` INT NOT NULL,
  `respuesta_esperada` TEXT NOT NULL,
  `estado` ENUM('pendiente', 'resuelto', 'expirado') DEFAULT 'pendiente',
  `expira_en` TIMESTAMP NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_desafios_escena`
    FOREIGN KEY (`escena_id`) REFERENCES `escenas` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Índices adicionales para rendimiento
CREATE INDEX `idx_escenas_activo` ON `escenas` (`activo`);
CREATE INDEX `idx_desafios_token` ON `desafios_captcha` (`token`);
CREATE INDEX `idx_obras_tipo` ON `obras` (`tipo`);

-- =============================================================================
-- 3. Datos de Prueba Iniciales (Seeds)
-- =============================================================================

-- Usuarios de ejemplo
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `correo`, `contrasena`, `rol`) VALUES
(1, 'Admin', 'Sistema', 'admin@apimedia.com', '$2b$10$wT5g1Y6Z...', 'admin'),
(2, 'Leonardo', 'Eckert', 'leonardo@ejemplo.com', '$2b$10$wT5g1Y6Z...', 'cliente');

-- Obras
INSERT INTO `obras` (`id`, `titulo`, `tipo`, `anio_estreno`) VALUES
(1, 'The Matrix', 'pelicula', 1999),
(2, 'Star Wars: Episode V - The Empire Strikes Back', 'pelicula', 1980),
(3, 'Breaking Bad', 'serie', 2008),
(4, 'Dragon Ball Z', 'anime', 1989);

-- Actores
INSERT INTO `actores` (`id`, `nombre_completo`) VALUES
(1, 'Laurence Fishburne'),
(2, 'Mark Hamill'),
(3, 'Bryan Cranston'),
(4, 'Masako Nozawa');

-- Personajes
INSERT INTO `personajes` (`id`, `obra_id`, `nombre`) VALUES
(1, 1, 'Morpheus'),
(2, 2, 'Luke Skywalker'),
(3, 3, 'Walter White'),
(4, 4, 'Son Goku');

-- Escenas icónicas con subtítulos incrustados
INSERT INTO `escenas` (`id`, `obra_id`, `actor_id`, `personaje_id`, `imagen_de_escena`, `subtitulo_texto`, `minuto_escena`, `dificultad`, `activo`) VALUES
(1, 1, 1, 1, 'matrix_pastilla_azul_roja.jpg', 'Toma la pastilla azul y el fin de la historia. Toma la pastilla roja y te quedas en el País de las Maravillas.', 28.45, 'medio', 1),
(2, 2, 2, 2, 'star_wars_yo_soy_tu_padre.jpg', 'No, yo soy tu padre.', 112.10, 'facil', 1),
(3, 3, 3, 3, 'breaking_bad_i_am_the_one_who_knocks.jpg', 'I am the one who knocks!', 45.12, 'medio', 1),
(4, 4, 4, 4, 'dragon_ball_z_over_9000.jpg', '¡Es de más de 8000!', 18.22, 'facil', 1);
