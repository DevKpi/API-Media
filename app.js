import http from "http";

const puerto = 3000;

const servidor = http.createServer((req, res) => {

  // if(req.url === "/") {
  //   res.statusCode = 200;
  //   res.setHeader("Content-Type", "text/plain");

  //   res.writeHead(200, { "Content-Type": "text/plain" });
  //   res.end("Bienvenido a la API de Media!\n");
  // }

if(req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "Application/json");
    res.end(JSON.stringify({ message: "Bienvenido a la API de Media!" }));
  }
  else{
    res.statusCode = 404;
  }

});

servidor.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});