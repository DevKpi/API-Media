import express from "express";
import ObraController from "../controllers/Obra.Controller.js";
import { verificarAuthOpcional } from "../middlewares/auth.js";

const router = express.Router();

// Listar todas las obras registradas
router.get("/", ObraController.obtenerObras);

// Obtener detalle de una obra por ID con sus escenas (subtitulo_texto visible solo para rol admin)
router.get("/:id", verificarAuthOpcional, ObraController.obtenerObraPorId);

export default router;
