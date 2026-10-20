import express from "express";
import CaptchaController from "../controllers/Captcha.Controller.js";

const router = express.Router();

// Generar un nuevo desafío CAPTCHA aleatorio (?dificultad=facil|medio|dificil)
router.get("/nuevo", CaptchaController.generarDesafio);

// Validar la respuesta del desafío enviada por el usuario
router.post("/validar", CaptchaController.validarDesafio);

export default router;
