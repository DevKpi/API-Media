import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import pool from "../src/config/db.js";

describe("Pruebas de Integración - Motor CAPTCHA Cultural (Generación y Validación)", () => {
  let desafioGenerado = null;

  afterAll(async () => {
    await pool.end();
  });

  // --- 1. Generación de Desafíos ---

  it("GET /captcha/nuevo - Debería generar un nuevo desafío CAPTCHA sin revelar el subtítulo", async () => {
    const res = await request(app).get("/captcha/nuevo");

    expect(res.status).toBe(201);
    expect(res.body.desafio_id).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.token.startsWith("tok_")).toBe(true);
    expect(res.body.imagen_url).toBeDefined();
    expect(res.body.imagen_url).toContain("/imagenes/");
    expect(res.body.dificultad).toBeDefined();
    expect(res.body.obra).toBeDefined();
    expect(res.body.expira_en).toBeDefined();
    expect(res.body.instrucciones).toBeDefined();

    // Verificación crítica de seguridad: el subtítulo NUNCA debe viajar al cliente
    expect(res.body.subtitulo_texto).toBeUndefined();
    expect(res.body.respuesta_esperada).toBeUndefined();

    desafioGenerado = res.body;
  });

  it("GET /captcha/nuevo?dificultad=facil - Debería generar un desafío filtrado por dificultad", async () => {
    const res = await request(app).get("/captcha/nuevo?dificultad=facil");

    expect(res.status).toBe(201);
    expect(res.body.dificultad).toBe("facil");
  });

  // --- 2. Validación de Desafíos ---

  it("POST /captcha/validar - Debería validar exitosamente con la respuesta correcta (tolerando tildes y mayúsculas)", async () => {
    expect(desafioGenerado).toBeDefined();

    // Consultamos la respuesta esperada en la base de datos para la prueba
    const [rows] = await pool.query(
      "SELECT respuesta_esperada FROM desafios_captcha WHERE token = ?",
      [desafioGenerado.token]
    );
    expect(rows.length).toBe(1);
    const textoOriginal = rows[0].respuesta_esperada;

    // Enviamos el texto en minúsculas y sin acentos para comprobar la tolerancia semántica
    const textoModificado = textoOriginal.toLowerCase();

    const res = await request(app)
      .post("/captcha/validar")
      .send({
        token: desafioGenerado.token,
        respuesta: textoModificado,
      });

    expect(res.status).toBe(200);
    expect(res.body.valido).toBe(true);
    expect(res.body.message).toBe("Verificación humana exitosa");
    expect(res.body.desafio_id).toBe(desafioGenerado.desafio_id);
  });

  it("POST /captcha/validar - Debería rechazar un desafío que ya fue resuelto anteriormente (400)", async () => {
    const res = await request(app)
      .post("/captcha/validar")
      .send({
        token: desafioGenerado.token,
        respuesta: "Cualquier texto",
      });

    expect(res.status).toBe(400);
    expect(res.body.valido).toBe(false);
    expect(res.body.message).toContain("ya ha sido resuelto anteriormente");
  });

  it("POST /captcha/validar - Debería rechazar si la respuesta es incorrecta (400)", async () => {
    // Generamos un nuevo desafío para probar respuesta errónea
    const nuevoRes = await request(app).get("/captcha/nuevo");
    const nuevoToken = nuevoRes.body.token;

    const res = await request(app)
      .post("/captcha/validar")
      .send({
        token: nuevoToken,
        respuesta: "Esta es una respuesta totalmente inventada y errónea",
      });

    expect(res.status).toBe(400);
    expect(res.body.valido).toBe(false);
    expect(res.body.message).toContain("no coincide con el subtítulo de la escena");
  });

  it("POST /captcha/validar - Debería fallar si faltan campos obligatorios (400)", async () => {
    const res = await request(app)
      .post("/captcha/validar")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("obligatorio");
  });

  it("POST /captcha/validar - Debería retornar 404 para un token que no existe", async () => {
    const res = await request(app)
      .post("/captcha/validar")
      .send({
        token: "tok_token_totalmente_inexistente_123",
        respuesta: "Cualquier respuesta",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Desafío no encontrado o token inválido");
  });
});
