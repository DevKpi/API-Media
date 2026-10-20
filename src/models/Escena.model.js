import pool from "../config/db.js";

class Escena {
  // Obtener todas las escenas con información de la obra, actor y personaje
  static async obtenerTodas({ obra_id, dificultad } = {}) {
    let query = `
      SELECT 
        e.id,
        e.imagen_de_escena,
        e.subtitulo_texto,
        e.minuto_escena,
        e.dificultad,
        e.activo,
        e.creado_en,
        o.id AS obra_id,
        o.titulo AS obra_titulo,
        o.tipo AS obra_tipo,
        o.anio_estreno AS obra_anio,
        a.id AS actor_id,
        a.nombre_completo AS actor_nombre,
        p.id AS personaje_id,
        p.nombre AS personaje_nombre
      FROM escenas e
      JOIN obras o ON e.obra_id = o.id
      LEFT JOIN actores a ON e.actor_id = a.id
      LEFT JOIN personajes p ON e.personaje_id = p.id
      WHERE e.activo = 1
    `;
    const params = [];

    if (obra_id) {
      query += " AND e.obra_id = ?";
      params.push(obra_id);
    }
    if (dificultad) {
      query += " AND e.dificultad = ?";
      params.push(dificultad);
    }

    query += " ORDER BY e.id ASC";

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Obtener una escena específica por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        e.id,
        e.imagen_de_escena,
        e.subtitulo_texto,
        e.minuto_escena,
        e.dificultad,
        e.activo,
        e.creado_en,
        o.id AS obra_id,
        o.titulo AS obra_titulo,
        o.tipo AS obra_tipo,
        o.anio_estreno AS obra_anio,
        a.id AS actor_id,
        a.nombre_completo AS actor_nombre,
        p.id AS personaje_id,
        p.nombre AS personaje_nombre
      FROM escenas e
      JOIN obras o ON e.obra_id = o.id
      LEFT JOIN actores a ON e.actor_id = a.id
      LEFT JOIN personajes p ON e.personaje_id = p.id
      WHERE e.id = ? AND e.activo = 1
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Obtener una escena aleatoria para generar un desafío CAPTCHA
  static async obtenerAleatoria(dificultad = null) {
    let query = `
      SELECT 
        e.id,
        e.imagen_de_escena,
        e.subtitulo_texto,
        e.minuto_escena,
        e.dificultad,
        o.titulo AS obra_titulo
      FROM escenas e
      JOIN obras o ON e.obra_id = o.id
      WHERE e.activo = 1
    `;
    const params = [];

    if (dificultad) {
      query += " AND e.dificultad = ?";
      params.push(dificultad);
    }

    query += " ORDER BY RAND() LIMIT 1";

    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  }
}

export default Escena;
