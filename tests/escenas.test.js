import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import pool from "../src/config/db.js";
import { firmarToken } from "../src/utils/jwt.js";

describe("Pruebas de Integración - Endpoints de Escenas, Obras e Imágenes Estáticas", () => {
  const tokenAdmin = firmarToken({
    id: 1,
    correo: "admin@apimedia.com",
    rol: "admin",
  });

  afterAll(async () => {
    await pool.end();
  });

  // --- 1. Endpoints de Escenas ---

  it("GET /escenas - Debería retornar escenas activas ocultando subtitulo_texto al público para evitar bots", async () => {
    const res = await request(app).get("/escenas");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const primeraEscena = res.body[0];
    expect(primeraEscena).toHaveProperty("id");
    expect(primeraEscena).toHaveProperty("imagen_de_escena");
    expect(primeraEscena).toHaveProperty("imagen_url");
    expect(primeraEscena.imagen_url).toContain("/imagenes/");
    expect(primeraEscena).toHaveProperty("obra_titulo");
    expect(primeraEscena.subtitulo_texto).toBeUndefined();
  });

  it("GET /escenas (Admin) - Debería incluir subtitulo_texto cuando consulta un administrador autenticado", async () => {
    const res = await request(app)
      .get("/escenas")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("subtitulo_texto");
  });

  it("GET /escenas?dificultad=facil - Debería filtrar las escenas por dificultad", async () => {
    const res = await request(app).get("/escenas?dificultad=facil");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((escena) => {
      expect(escena.dificultad).toBe("facil");
    });
  });

  it("GET /escenas?dificultad=invalida - Debería retornar 400 ante una dificultad no válida", async () => {
    const res = await request(app).get("/escenas?dificultad=invalida");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("dificultad proporcionada no es válida");
  });

  it("GET /escenas/:id - Debería retornar el detalle público de una escena existente sin exponer el subtítulo (200)", async () => {
    const res = await request(app).get("/escenas/1");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.imagen_de_escena).toBe("matrix_pastilla_azul_roja.jpg");
    expect(res.body.imagen_url).toContain("/imagenes/matrix_pastilla_azul_roja.jpg");
    expect(res.body.obra_titulo).toBe("The Matrix");
    expect(res.body.subtitulo_texto).toBeUndefined();
  });

  it("GET /escenas/:id - Debería retornar 404 para una escena inexistente", async () => {
    const res = await request(app).get("/escenas/99999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Escena no encontrada");
  });

  it("GET /escenas/:id - Debería retornar 400 si el ID no es numérico", async () => {
    const res = await request(app).get("/escenas/abc");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("debe ser un número válido");
  });

  // --- 2. Servicio de Archivos Estáticos ---

  it("GET /imagenes/:archivo - Debería servir la imagen estática HD con subtítulo correctamente (200)", async () => {
    const res = await request(app).get("/imagenes/matrix_pastilla_azul_roja.jpg");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/jpeg");
    expect(res.body.length).toBeGreaterThan(10000);
  });

  it("GET /demo - Debería servir la interfaz web interactiva HTML (200)", async () => {
    const res = await request(app).get("/demo/");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("API - Media");
  });

  it("OPTIONS / - Debería incluir cabeceras CORS de acceso permitido", async () => {
    const res = await request(app).options("/");

    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  // --- 3. Endpoints de Obras Audiovisuales ---

  it("GET /obras - Debería retornar todas las obras con el conteo de escenas", async () => {
    const res = await request(app).get("/obras");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const obra = res.body[0];
    expect(obra).toHaveProperty("id");
    expect(obra).toHaveProperty("titulo");
    expect(obra).toHaveProperty("tipo");
    expect(obra).toHaveProperty("total_escenas");
  });

  it("GET /obras/:id - Debería retornar el detalle de una obra con sus escenas anidadas sin exponer subtítulos al público", async () => {
    const res = await request(app).get("/obras/1");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.titulo).toBe("The Matrix");
    expect(Array.isArray(res.body.escenas)).toBe(true);
    expect(res.body.escenas[0].subtitulo_texto).toBeUndefined();
  });

  // --- 4. Manejador de Rutas no encontradas (404) ---

  it("GET /ruta-inexistente - Debería retornar error 404 en formato JSON uniforme", async () => {
    const res = await request(app).get("/ruta-inexistente");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Ruta no encontrada" });
  });
});
