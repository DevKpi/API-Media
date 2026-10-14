-- =============================================================================
-- SCRIPT DE CARGA DE DATOS DE PRUEBA (SEEDS) - API-MEDIA
-- Base de datos: api_media_db
-- Motor compatible: MySQL / MariaDB (XAMPP / phpMyAdmin / MySQL Workbench)
-- =============================================================================

USE `api_media_db`;

-- Desactivar temporalmente revisión de claves foráneas para permitir limpieza de tablas
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `desafios_captcha`;
DELETE FROM `escenas`;
DELETE FROM `personajes`;
DELETE FROM `actores`;
DELETE FROM `obras`;
DELETE FROM `usuarios`;

-- Reiniciar contadores autoincrementales
ALTER TABLE `usuarios` AUTO_INCREMENT = 1;
ALTER TABLE `obras` AUTO_INCREMENT = 1;
ALTER TABLE `actores` AUTO_INCREMENT = 1;
ALTER TABLE `personajes` AUTO_INCREMENT = 1;
ALTER TABLE `escenas` AUTO_INCREMENT = 1;

-- Reactivar claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. TABLA: usuarios
-- Contraseñas reales hasheadas con bcrypt (12 salt rounds):
--   - admin@apimedia.com       => Admin123*      (rol: admin)
--   - leonardo@ejemplo.com     => Cliente123*    (rol: cliente)
--   - carlos.gomez@ejemplo.com => ClaveSegura123 (rol: cliente)
--   - mariana.lopez@ejemplo.com=> Segura2026*    (rol: cliente)
-- =============================================================================

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `correo`, `contrasena`, `rol`) VALUES
(1, 'Admin', 'Sistema', 'admin@apimedia.com', '$2b$12$.KmxNRbv5WM6uxc5M8.A/ue3Tg/efo7zA9Wkg48mpCkCQg/JeNDPa', 'admin'),
(2, 'Leonardo', 'Eckert', 'leonardo@ejemplo.com', '$2b$12$8gSuqbxTwOP7LPHJU8VCUeoz4GpGyaJE9ZjLbHNDlWi9YC8rKZKfi', 'cliente'),
(3, 'Carlos', 'Gomez', 'carlos.gomez@ejemplo.com', '$2b$12$WfW9Tuvkgh2ZVzKH3vHGkuRPbmkOegrxfwJg7AU80uH2.noJGrzJy', 'cliente'),
(4, 'Mariana', 'Lopez', 'mariana.lopez@ejemplo.com', '$2b$12$/uApHS/cwRXjJ9csPV8P/e9YajzRGmiGHGEJTL65fxHKT653OUB72', 'cliente');

-- =============================================================================
-- 2. TABLA: obras (Películas, Series, Anime)
-- =============================================================================

INSERT INTO `obras` (`id`, `titulo`, `tipo`, `anio_estreno`) VALUES
(1, 'The Matrix', 'pelicula', 1999),
(2, 'Star Wars: Episode V - The Empire Strikes Back', 'pelicula', 1980),
(3, 'Breaking Bad', 'serie', 2008),
(4, 'Dragon Ball Z', 'anime', 1989),
(5, 'Fight Club', 'pelicula', 1999),
(6, 'Pulp Fiction', 'pelicula', 1994),
(7, 'Death Note', 'anime', 2006),
(8, 'Game of Thrones', 'serie', 2011);

-- =============================================================================
-- 3. TABLA: actores (Actores de imagen real o actores de voz)
-- =============================================================================

INSERT INTO `actores` (`id`, `nombre_completo`) VALUES
(1, 'Laurence Fishburne'),
(2, 'Mark Hamill'),
(3, 'Bryan Cranston'),
(4, 'Masako Nozawa'),
(5, 'Brad Pitt'),
(6, 'Samuel L. Jackson'),
(7, 'Mamoru Miyano'),
(8, 'Peter Dinklage');

-- =============================================================================
-- 4. TABLA: personajes
-- =============================================================================

INSERT INTO `personajes` (`id`, `obra_id`, `nombre`) VALUES
(1, 1, 'Morpheus'),
(2, 2, 'Luke Skywalker'),
(3, 3, 'Walter White'),
(4, 4, 'Son Goku'),
(5, 5, 'Tyler Durden'),
(6, 6, 'Jules Winnfield'),
(7, 7, 'Light Yagami'),
(8, 8, 'Tyrion Lannister');

-- =============================================================================
-- 5. TABLA: escenas (Base del sistema CAPTCHA)
-- =============================================================================

INSERT INTO `escenas` (`id`, `obra_id`, `actor_id`, `personaje_id`, `imagen_de_escena`, `subtitulo_texto`, `minuto_escena`, `dificultad`, `activo`) VALUES
(1, 1, 1, 1, 'matrix_pastilla_azul_roja.jpg', 'Toma la pastilla azul y el fin de la historia. Toma la pastilla roja y te quedas en el País de las Maravillas.', 28.45, 'medio', 1),
(2, 2, 2, 2, 'star_wars_yo_soy_tu_padre.jpg', 'No, yo soy tu padre.', 112.10, 'facil', 1),
(3, 3, 3, 3, 'breaking_bad_i_am_the_one_who_knocks.jpg', 'I am the one who knocks!', 45.12, 'medio', 1),
(4, 4, 4, 4, 'dragon_ball_z_over_8000.jpg', '¡Es de más de 8000!', 18.22, 'facil', 1),
(5, 5, 5, 5, 'fight_club_primera_regla.jpg', 'La primera regla del Club de la Pelea es: no se habla del Club de la Pelea.', 30.15, 'facil', 1),
(6, 6, 6, 6, 'pulp_fiction_ezequiel_25_17.jpg', 'Ezequiel 25:17. El camino del hombre recto está por todos lados rodeado por la injusticia de los egoístas.', 14.50, 'dificil', 1),
(7, 7, 7, 7, 'death_note_tomo_una_patata.jpg', 'Tomaré una patata frita... ¡y me la comeré!', 12.05, 'facil', 1),
(8, 8, 8, 8, 'got_bebo_y_se_cosas.jpg', 'Eso es lo que hago: bebo y sé cosas.', 38.40, 'facil', 1);

-- =============================================================================
-- 6. TABLA: desafios_captcha (Sesiones de validación)
-- =============================================================================

INSERT INTO `desafios_captcha` (`id`, `token`, `escena_id`, `respuesta_esperada`, `estado`, `expira_en`) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'tok_test_matrix_9f8a7b6c5d4e3f2a1b0c', 1, 'Toma la pastilla azul y el fin de la historia', 'pendiente', DATE_ADD(NOW(), INTERVAL 15 MINUTE)),
('b1ffcd88-8b1a-3de7-aa5c-5aa8ac270b22', 'tok_test_starwars_1a2b3c4d5e6f7a8b9c0d', 2, 'No, yo soy tu padre.', 'resuelto', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
('c2eedc77-7a2b-2cd6-994b-4bb7ab160c33', 'tok_test_breaking_deadbeef123456789abc', 3, 'I am the one who knocks!', 'expirado', DATE_SUB(NOW(), INTERVAL 1 HOUR));
