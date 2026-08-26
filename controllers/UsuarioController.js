import Usuario from "../models/Usuario.js";

// Arreglo en memoria para almacenar los usuarios
const usuarios = [];

class UsuarioController {
    // Obtener todos los usuarios
    static obtenerUsuarios(req, res) {
        res.status(200).json(usuarios);
    }

    // Obtener un usuario por ID
    static obtenerUsuarioPorId(req, res) {
        const id = parseInt(req.params.id);
        const usuario = usuarios.find(u => u.id === id);

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json(usuario);
    }

    // Crear un nuevo usuario
    static crearUsuario(req, res) {
        const { id, nombre, apellido, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
        }

        // Si no se envía ID, se auto-incrementa
        const nuevoId = id || (usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1);
        const nuevoUsuario = new Usuario(nuevoId, nombre, apellido, correo, contrasena);

        usuarios.push(nuevoUsuario);
        res.status(201).json(nuevoUsuario);
    }

    // Actualizar un usuario existente
    static actualizarUsuario(req, res) {
        const id = parseInt(req.params.id);
        const index = usuarios.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const { nombre, apellido, correo } = req.body;
        if (nombre !== undefined) usuarios[index].nombre = nombre;
        if (apellido !== undefined) usuarios[index].apellido = apellido;
        if (correo !== undefined) usuarios[index].correo = correo;

        res.status(200).json(usuarios[index]);
    }

    // Eliminar un usuario
    static eliminarUsuario(req, res) {
        const id = parseInt(req.params.id);
        const index = usuarios.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const [eliminado] = usuarios.splice(index, 1);
        res.status(200).json({ message: "Usuario eliminado correctamente", usuario: eliminado });
    }
}

export default UsuarioController;