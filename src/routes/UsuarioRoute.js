import express from "express";
import UsuarioController from "../controllers/UsuarioController.js";
import {
  validarRegistroUsuario,
  validarActualizacionUsuario,
} from "../middlewares/validarUsuario.js";

const router = express.Router();

router.get("/", UsuarioController.obtenerUsuarios);
router.get("/:id", UsuarioController.obtenerUsuarioPorId);
router.post("/", validarRegistroUsuario, UsuarioController.crearUsuario);
router.put("/:id", validarActualizacionUsuario, UsuarioController.actualizarUsuario);
router.delete("/:id", UsuarioController.eliminarUsuario);

export default router;