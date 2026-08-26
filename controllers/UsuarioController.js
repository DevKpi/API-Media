import Usuario from "../models/Usuario.js";

class UsuarioController {
    static obtenerUsuarios(req, res) {
        // Lógica para obtener todos los usuarios
        res.json({ message: "Obteniendo todos los usuarios" });
    }
}

export default UsuarioController;