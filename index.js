import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { probarConexion } from "./src/config/db.js";
import usuarioRoutes from "./src/routes/Usuario.Route.js";
import escenaRoutes from "./src/routes/Escena.Route.js";
import obraRoutes from "./src/routes/Obra.Route.js";
import captchaRoutes from "./src/routes/Captcha.Route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const puerto = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Servidor de archivos estáticos para las imágenes de escenas
app.use("/imagenes", express.static(path.join(__dirname, "public/imagenes")));

// Endpoint raíz de bienvenida / healthcheck
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Media!" });
});

// Enrutadores principales
app.use("/usuarios", usuarioRoutes);
app.use("/escenas", escenaRoutes);
app.use("/obras", obraRoutes);
app.use("/captcha", captchaRoutes);

// Manejador para rutas no encontradas (404 en formato JSON)
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(puerto, async () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
    await probarConexion();
  });
}

export default app;
