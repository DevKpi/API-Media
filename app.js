import express from "express";

const puerto = 3000;

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Media!" });
});

app.get("/texto", (req, res) => {
  res.type("text/plain");
  res.send("Bienvenido a la API de Media!\n");
});

app.get("/html", (req, res) => {
  res.type("text/html");
  res.send("<h1>Bienvenido a la API de Media!</h1>");
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
