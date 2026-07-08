import http from "http";

const puerto = 3000;

const servidor = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!\n");
});

servidor.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});