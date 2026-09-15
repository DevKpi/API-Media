import pool from "../config/db.js";

class Usuario {
  constructor(id, nombre, apellido, correo, rol = "cliente", creado_en = null) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.rol = rol;
    this.creado_en = creado_en;
  }

  // Obtener todos los usuarios de la base de datos
  static async obtenerTodos() {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, correo, rol, creado_en FROM usuarios ORDER BY id ASC"
    );
    return rows;
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, correo, rol, creado_en FROM usuarios WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }

  // Obtener usuario por Correo
  static async obtenerPorCorreo(correo) {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );
    return rows[0] || null;
  }

  static async obtenerPorNombre(nombre) {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre = ?",
      [nombre]
    );
    return rows[0] || null;
  }

  // Crear un nuevo usuario en la base de datos
  static async crear({ nombre, apellido, correo, contrasena, rol = "cliente" }) {
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellido || null, correo, contrasena, rol]
    );
    return resultado.insertId;
  }

  // Actualizar un usuario existente
  static async actualizar(id, { nombre, apellido, correo }) {
    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      campos.push("nombre = ?");
      valores.push(nombre);
    }
    if (apellido !== undefined) {
      campos.push("apellido = ?");
      valores.push(apellido);
    }
    if (correo !== undefined) {
      campos.push("correo = ?");
      valores.push(correo);
    }

    if (campos.length === 0) return false;

    valores.push(id);
    const [resultado] = await pool.query(
      `UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );
    return resultado.affectedRows > 0;
  }

  // Eliminar un usuario por ID
  static async eliminar(id) {
    const [resultado] = await pool.query(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );
    return resultado.affectedRows > 0;
  }
}

export default Usuario;