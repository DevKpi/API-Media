import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
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

// Habilitar CORS para permitir peticiones web desde cualquier origen local
app.use(cors());

// Parseo de cuerpo JSON
app.use(express.json());

// Servidor de archivos estáticos para las imágenes de escenas
app.use("/imagenes", express.static(path.join(__dirname, "public/imagenes")));

// Servidor de archivos estáticos para la interfaz Demo Web
app.use("/demo", express.static(path.join(__dirname, "public/demo")));

// Documentación interactiva con Swagger UI
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "docs/openapi.yaml"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn("No se pudo cargar la especificación OpenAPI para Swagger UI:", err.message);
}

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
    console.log(`Web Demo disponible en: http://localhost:${puerto}/demo`);
    console.log(`Swagger UI disponible en: http://localhost:${puerto}/api-docs`);
    await probarConexion();
  });
}

export default app;
