import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import pool from "../src/config/db.js";

describe("Pruebas de Integración - Endpoints de Usuarios (Vitest + Supertest)", () => {
  let usuarioCreadoId = null;
  const timestamp = Date.now();
  const correoPrueba = `test_${timestamp}@ejemplo.com`;

  afterAll(async () => {
    // Cerrar el pool de conexiones para que las pruebas finalicen limpiamente
    await pool.end();
  });

  it("GET / - Debería retornar el mensaje de bienvenida", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Bienvenido a la API de Media!" });
  });

  it("GET /usuarios - Debería obtener el listado de usuarios", async () => {
    const res = await request(app).get("/usuarios");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /usuarios/1 - Debería obtener el usuario administrador por ID", async () => {
    const res = await request(app).get("/usuarios/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.correo).toBeTruthy();
  });

  it("POST /usuarios - Debería crear un nuevo usuario con éxito", async () => {
    const nuevoUsuario = {
      nombre: "Carlos",
      apellido: "Gomez",
      correo: correoPrueba,
      contrasena: "clave123",
      rol: "cliente",
    };

    const res = await request(app)
      .post("/usuarios")
      .send(nuevoUsuario);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Usuario creado con éxito");
    expect(res.body.usuario.id).toBeDefined();
    expect(res.body.usuario.correo).toBe(correoPrueba);

    usuarioCreadoId = res.body.usuario.id;
  });

  it("POST /usuarios - Debería fallar al intentar registrar un correo duplicado (409)", async () => {
    const usuarioDuplicado = {
      nombre: "Duplicado",
      correo: correoPrueba,
      contrasena: "otraClave",
    };

    const res = await request(app)
      .post("/usuarios")
      .send(usuarioDuplicado);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("El correo ya se encuentra registrado");
  });

  it("POST /usuarios - Debería fallar si faltan campos obligatorios (400)", async () => {
    const usuarioIncompleto = {
      nombre: "Incompleto",
    };

    const res = await request(app)
      .post("/usuarios")
      .send(usuarioIncompleto);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Nombre, correo y contraseña son obligatorios");
  });

  it("PUT /usuarios/:id - Debería actualizar los datos del usuario creado", async () => {
    expect(usuarioCreadoId).toBeDefined();

    const cambios = {
      nombre: "Carlos Actualizado",
      apellido: "Gomez Perez",
    };

    const res = await request(app)
      .put(`/usuarios/${usuarioCreadoId}`)
      .send(cambios);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario actualizado correctamente");
    expect(res.body.usuario.nombre).toBe("Carlos Actualizado");
    expect(res.body.usuario.apellido).toBe("Gomez Perez");
  });

  it("DELETE /usuarios/:id - Debería eliminar el usuario creado", async () => {
    expect(usuarioCreadoId).toBeDefined();

    const res = await request(app).delete(`/usuarios/${usuarioCreadoId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario eliminado correctamente");
    expect(res.body.usuario.id).toBe(usuarioCreadoId);
  });

  it("GET /usuarios/:id - Debería retornar 404 para el usuario recién eliminado", async () => {
    const res = await request(app).get(`/usuarios/${usuarioCreadoId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Usuario no encontrado");
  });
});
