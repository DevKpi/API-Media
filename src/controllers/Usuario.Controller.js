import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.model.js";

class UsuarioController {
  // Obtener todos los usuarios
  static async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.obtenerTodos();
      res.status(200).json(usuarios);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener usuarios" });
    }
  }

  // Obtener un usuario por ID
  static async obtenerUsuarioPorId(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado debe ser un número válido" });
      }

      const usuario = await Usuario.obtenerPorId(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json(usuario);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener el usuario" });
    }
  }

  // Crear un nuevo usuario
  static async crearUsuario(req, res) {
    try {
      const { nombre, apellido, correo, contrasena, rol } = req.body;

      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({
          message: "Nombre, correo y contraseña son obligatorios",
        });
      }

      // Verificar si el correo ya existe
      const usuarioExistente = await Usuario.obtenerPorCorreo(correo);
      if (usuarioExistente) {
        return res.status(409).json({ message: "El correo ya se encuentra registrado" });
      }

      // Hashear la contraseña con bcrypt
      const saltRounds = 12;
      const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

      const nuevoId = await Usuario.crear({
        nombre,
        apellido,
        correo,
        contrasena: contrasenaHasheada,
        rol,
      });
      const usuarioCreado = await Usuario.obtenerPorId(nuevoId);

      res.status(201).json({
        message: "Usuario creado con éxito",
        usuario: usuarioCreado,
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({ message: "Error interno del servidor al crear el usuario" });
    }
  }

  // Iniciar sesión
  static async login(req, res) {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
      }

      const usuario = await Usuario.obtenerPorCorreo(correo);
      if (!usuario) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!esValida) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // No retornar la contraseña en la respuesta
      const { contrasena: _, ...datosUsuario } = usuario;

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        usuario: datosUsuario,
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ message: "Error interno del servidor al iniciar sesión" });
    }
  }

  // Actualizar un usuario existente
  static async actualizarUsuario(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado debe ser un número válido" });
      }

      const usuario = await Usuario.obtenerPorId(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const { nombre, apellido, correo } = req.body;
      if (nombre === undefined && apellido === undefined && correo === undefined) {
        return res.status(400).json({ message: "Debe enviar al menos un campo para actualizar" });
      }

      // Si actualiza correo, verificar que no esté ocupado por otro usuario
      if (correo && correo !== usuario.correo) {
        const correoExistente = await Usuario.obtenerPorCorreo(correo);
        if (correoExistente) {
          return res.status(409).json({ message: "El nuevo correo ya está en uso por otro usuario" });
        }
      }

      await Usuario.actualizar(id, { nombre, apellido, correo });
      const usuarioActualizado = await Usuario.obtenerPorId(id);

      res.status(200).json({
        message: "Usuario actualizado correctamente",
        usuario: usuarioActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res.status(500).json({ message: "Error interno del servidor al actualizar el usuario" });
    }
  }

  // Eliminar un usuario
  static async eliminarUsuario(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado debe ser un número válido" });
      }

      const usuario = await Usuario.obtenerPorId(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await Usuario.eliminar(id);
      res.status(200).json({
        message: "Usuario eliminado correctamente",
        usuario,
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ message: "Error interno del servidor al eliminar el usuario" });
    }
  }
}

export default UsuarioController;