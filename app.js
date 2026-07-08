import http from "http";

const puerto = 3000;

const servidor = http.createServer((req, res) => {

if(req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "Application/json");
    res.end(JSON.stringify({ message: "Bienvenido a la API de Media!" }));
  }
  else if(req.url === "/texto"){
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bienvenido a la API de Media!\n");
  }
  else if(req.url === "/html"){
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Bienvenido a la API de Media!</h1>");
  }
  else{
    res.statusCode = 404;
    res.setHeader("Content-Type", "Application/json");
    res.end(JSON.stringify({ message: "Ruta no encontrada" }));
  }

});

servidor.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});