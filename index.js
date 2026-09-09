import express from "express";
import dotenv from "dotenv";
import { probarConexion } from "./src/config/db.js";
import usuarioRoutes from "./src/routes/UsuarioRoute.js";

dotenv.config();

const puerto = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Media!" });
});

app.use("/usuarios", usuarioRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(puerto, async () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
    await probarConexion();
  });
}

export default app;
