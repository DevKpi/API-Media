import express from "express";

import usuarioRoutes from "./routes/UsuarioRoute.js";

const puerto = 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Media!" });
});

app.use("/usuarios", usuarioRoutes);


app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
