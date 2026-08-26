import express from "express";

const puerto = 3000;

const app = express();
app.use(express.json());

const persona = [
  { id: 1, nombre: "Leonardo", apellido: "Eckert" },
  { id: 2, nombre: "Fabrizio", apellido: "Perez" },
  { id: 3, nombre: "Esteban", apellido: "Balladares" }
];

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Media!" });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
