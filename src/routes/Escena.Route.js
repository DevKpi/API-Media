import express from "express";
import EscenaController from "../controllers/Escena.Controller.js";

const router = express.Router();

// Listar escenas con filtros opcionales (?obra_id=1&dificultad=facil)
router.get("/", EscenaController.obtenerEscenas);

// Obtener detalle de una escena específica por ID
router.get("/:id", EscenaController.obtenerEscenaPorId);

export default router;
