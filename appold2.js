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
  persona.push(req.body);
  const nombres = persona.map((p) => p.nombre);
  console.log("Nombres en el arreglo:", nombres);
  res.status(201).json(nombres);
});

app.put("/actualizar/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const personaIndex = persona.findIndex((p) => p.id === id);
  if (personaIndex === -1) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }
  persona[personaIndex] = { ...persona[personaIndex], ...req.body };
  res.json(persona[personaIndex]);
});

app.put("/actualizarr/:id", (req, res) => {
  const id = parseInt(req.params.id);

  for (let i = 0; i < persona.length; i++) {
    if (persona[i].id === id) {
      persona[i] = { ...persona[i], ...req.body };
      return res.json(persona[i]);
    }
  }

  if (personaIndex === -1) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }

});

app.patch("/patch/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const personaIndex = persona.findIndex((p) => p.id === id);
  if (personaIndex === -1) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }
  persona[personaIndex] = { ...persona[personaIndex], ...req.body };
  res.json(persona[personaIndex]);
});


app.delete("/eliminar/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const personaIndex = persona.findIndex((p) => p.id === id);
  if (personaIndex === -1) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }
  const eliminado = persona.splice(personaIndex, 1);
  res.json(eliminado[0]);
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
