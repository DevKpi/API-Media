import express from "express";
import UsuarioController from "../controllers/UsuarioController.js";

const router = express.Router();

router.get("/", UsuarioController.obtenerUsuarios);
router.get("/:id", UsuarioController.obtenerUsuarioPorId);
router.post("/", UsuarioController.crearUsuario);
router.put("/:id", UsuarioController.actualizarUsuario);
router.delete("/:id", UsuarioController.eliminarUsuario);

export default router;