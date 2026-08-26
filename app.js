import express from "express";

const puerto = 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Media!" });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
