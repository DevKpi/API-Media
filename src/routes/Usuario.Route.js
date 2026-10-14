import express from "express";
import UsuarioController from "../controllers/Usuario.Controller.js";
import {
  validarRegistroUsuario,
  validarActualizacionUsuario,
  validarLoginUsuario,
} from "../middlewares/validar.js";
import { verificarAuth, soloAdmin } from "../middlewares/auth.js";

const router = express.Router();

// --- Rutas Públicas ---
// Registrar nuevo usuario
router.post("/", validarRegistroUsuario, UsuarioController.crearUsuario);

// Iniciar sesión (Login)
router.post("/login", validarLoginUsuario, UsuarioController.login);

// --- Rutas Protegidas (Requieren Token JWT) ---
// Obtener perfil del usuario autenticado
router.get("/perfil", verificarAuth, UsuarioController.obtenerPerfil);

// Obtener listado de todos los usuarios
router.get("/", verificarAuth, UsuarioController.obtenerUsuarios);

// Obtener detalle de usuario por ID
router.get("/:id", verificarAuth, UsuarioController.obtenerUsuarioPorId);

// Actualizar datos de usuario por ID
router.put(
  "/:id",
  verificarAuth,
  validarActualizacionUsuario,
  UsuarioController.actualizarUsuario
);

// Eliminar usuario por ID (exclusivo para administradores)
router.delete("/:id", verificarAuth, soloAdmin, UsuarioController.eliminarUsuario);

export default router;