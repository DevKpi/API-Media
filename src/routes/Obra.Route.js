import express from "express";
import ObraController from "../controllers/Obra.Controller.js";

const router = express.Router();

// Listar todas las obras registradas
router.get("/", ObraController.obtenerObras);

// Obtener detalle de una obra por ID con sus escenas
router.get("/:id", ObraController.obtenerObraPorId);

export default router;
