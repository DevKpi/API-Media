import pool from "../config/db.js";

class Desafio {
  // Crear un nuevo desafío CAPTCHA
  static async crear({ id, token, escena_id, respuesta_esperada, expira_en }) {
    const query = `
      INSERT INTO desafios_captcha (id, token, escena_id, respuesta_esperada, estado, expira_en)
      VALUES (?, ?, ?, ?, 'pendiente', ?)
    `;
    await pool.query(query, [id, token, escena_id, respuesta_esperada, expira_en]);
    return id;
  }

  // Obtener un desafío por su token público
  static async obtenerPorToken(token) {
    const query = `
      SELECT 
        d.id,
        d.token,
        d.escena_id,
        d.respuesta_esperada,
        d.estado,
        d.expira_en,
        d.creado_en,
        e.imagen_de_escena,
        e.dificultad,
        o.titulo AS obra_titulo
      FROM desafios_captcha d
      JOIN escenas e ON d.escena_id = e.id
      JOIN obras o ON e.obra_id = o.id
      WHERE d.token = ?
    `;
    const [rows] = await pool.query(query, [token]);
    return rows[0] || null;
  }

  // Actualizar el estado de un desafío ('resuelto', 'expirado', 'pendiente')
  static async actualizarEstado(token, nuevoEstado) {
    const query = `UPDATE desafios_captcha SET estado = ? WHERE token = ?`;
    const [result] = await pool.query(query, [nuevoEstado, token]);
    return result.affectedRows > 0;
  }

  // Marcar automáticamente como expirados los desafíos vencidos que siguen pendientes
  static async limpiarExpirados() {
    const query = `
      UPDATE desafios_captcha 
      SET estado = 'expirado' 
      WHERE expira_en < NOW() AND estado = 'pendiente'
    `;
    const [result] = await pool.query(query);
    return result.affectedRows;
  }
}

export default Desafio;
