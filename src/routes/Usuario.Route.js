import express from "express";
import UsuarioController from "../controllers/Usuario.Controller.js";
import {
  validarRegistroUsuario,
  validarActualizacionUsuario,
  validarLoginUsuario,
} from "../middlewares/validar.js";
import {
  verificarAuth,
  verificarAuthOpcional,
  soloAdmin,
  propietarioOAdmin,
} from "../middlewares/auth.js";

const router = express.Router();

// --- Rutas Públicas ---
// Registrar nuevo usuario (solo un admin autenticado puede asignar rol 'admin')
router.post("/", verificarAuthOpcional, validarRegistroUsuario, UsuarioController.crearUsuario);

// Iniciar sesión (Login)
router.post("/login", validarLoginUsuario, UsuarioController.login);

// --- Rutas Protegidas (Requieren Token JWT) ---
// Obtener perfil del usuario autenticado
router.get("/perfil", verificarAuth, UsuarioController.obtenerPerfil);

// Obtener listado de todos los usuarios
router.get("/", verificarAuth, UsuarioController.obtenerUsuarios);

// Obtener detalle de usuario por ID
router.get("/:id", verificarAuth, UsuarioController.obtenerUsuarioPorId);

// Actualizar datos de usuario por ID (solo el propio titular o un administrador)
router.put(
  "/:id",
  verificarAuth,
  propietarioOAdmin,
  validarActualizacionUsuario,
  UsuarioController.actualizarUsuario
);

// Eliminar usuario por ID (exclusivo para administradores)
router.delete("/:id", verificarAuth, soloAdmin, UsuarioController.eliminarUsuario);

export default router;
