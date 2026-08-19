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

app.get("/persona", (req, res) => {
  res.json(persona);
});

app.post("/crear", (req, res) => {
  const { id, nombre, apellido } = req.body;
  const nuevaPersona = { id, nombre, apellido };
  persona.push(nuevaPersona);
  res.status(201).json(nuevaPersona);
});

app.get("/texto", (req, res) => {
  res.type("text/plain");
  res.send("Bienvenido a la API de Media!\n");
});

app.get("/html", (req, res) => {
  res.type("text/html");
  res.send("<h1>Bienvenido a la API de Media!</h1>");
});

app.get("/test", (req, res) => {
  res.send("Testeo");
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
