import pool from "../config/db.js";

class Obra {
  // Obtener todas las obras audiovisuales con la cantidad de escenas registradas
  static async obtenerTodas() {
    const query = `
      SELECT 
        o.id,
        o.titulo,
        o.tipo,
        o.anio_estreno,
        o.creado_en,
        COUNT(e.id) AS total_escenas
      FROM obras o
      LEFT JOIN escenas e ON o.id = e.obra_id AND e.activo = 1
      GROUP BY o.id, o.titulo, o.tipo, o.anio_estreno, o.creado_en
      ORDER BY o.id ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  // Obtener detalle de una obra por ID junto con sus escenas
  static async obtenerPorId(id) {
    const queryObra = `SELECT * FROM obras WHERE id = ?`;
    const [obras] = await pool.query(queryObra, [id]);

    if (!obras[0]) return null;

    const queryEscenas = `
      SELECT 
        id,
        imagen_de_escena,
        subtitulo_texto,
        minuto_escena,
        dificultad
      FROM escenas
      WHERE obra_id = ? AND activo = 1
    `;
    const [escenas] = await pool.query(queryEscenas, [id]);

    return {
      ...obras[0],
      escenas,
    };
  }
}

export default Obra;
