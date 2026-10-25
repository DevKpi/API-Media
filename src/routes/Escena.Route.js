import express from "express";
import EscenaController from "../controllers/Escena.Controller.js";
import { verificarAuthOpcional } from "../middlewares/auth.js";

const router = express.Router();

// Listar escenas con filtros opcionales (?obra_id=1&dificultad=facil)
// Solo administradores autenticados reciben el campo `subtitulo_texto` para prevenir scraping de respuestas CAPTCHA
router.get("/", verificarAuthOpcional, EscenaController.obtenerEscenas);

// Obtener detalle de una escena específica por ID
router.get("/:id", verificarAuthOpcional, EscenaController.obtenerEscenaPorId);

export default router;
