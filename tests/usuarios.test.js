import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import pool from "../src/config/db.js";
import { firmarToken } from "../src/utils/jwt.js";

describe("Pruebas de Integración - Endpoints de Usuarios y Seguridad JWT (Vitest + Supertest)", () => {
  let usuarioCreadoId = null;
  let adminTemporalId = null;
  let tokenCliente = null;
  const tokenAdmin = firmarToken({
    id: 9999,
    correo: "admin@apimedia.com",
    rol: "admin",
  });
  const timestamp = Date.now();
  const correoPrueba = `test_${timestamp}@ejemplo.com`;
  const correoAdminTemporal = `admin_temp_${timestamp}@ejemplo.com`;

  afterAll(async () => {
    if (adminTemporalId) {
      await pool.query("DELETE FROM usuarios WHERE id = ?", [adminTemporalId]);
    }
    // Cerrar el pool de conexiones para que las pruebas finalicen limpiamente
    await pool.end();
  });

  // --- 1. Endpoints Públicos ---

  it("GET / - Debería retornar el mensaje de bienvenida sin requerir autenticación", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Bienvenido a la API de Media!" });
  });

  it("POST /usuarios - Debería registrar un nuevo usuario con datos válidos (cumpliendo RegEx)", async () => {
    const nuevoUsuario = {
      nombre: "Carlos",
      apellido: "Gomez",
      correo: correoPrueba,
      contrasena: "ClaveSegura123",
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

  it("POST /usuarios [Seguridad RBAC] - Debería bloquear con 403 el registro público con rol 'admin' sin token de administrador", async () => {
    const res = await request(app)
      .post("/usuarios")
      .send({
        nombre: "Intruso",
        correo: `intruso_${timestamp}@ejemplo.com`,
        contrasena: "ClaveSegura123",
        rol: "admin",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("solo un administrador autenticado puede asignar el rol 'admin'");
  });

  it("POST /usuarios [Seguridad RBAC] - Debería permitir crear un usuario 'admin' cuando lo solicita un administrador autenticado (201)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        nombre: "Admin Auxiliar",
        correo: correoAdminTemporal,
        contrasena: "ClaveSegura123",
        rol: "admin",
      });

    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe("admin");
    adminTemporalId = res.body.usuario.id;
  });

  // --- 2. Pruebas de Login y Emisión de Token JWT ---

  it("POST /usuarios/login - Debería iniciar sesión y retornar un JWT válido junto a los datos del usuario (200)", async () => {
    const res = await request(app)
      .post("/usuarios/login")
      .send({
        correo: correoPrueba,
        contrasena: "ClaveSegura123",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Inicio de sesión exitoso");
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario.correo).toBe(correoPrueba);
    expect(res.body.usuario.contrasena).toBeUndefined();

    // Guardar token emitido para pruebas subsecuentes
    tokenCliente = res.body.token;
  });

  it("POST /usuarios/login - Debería fallar si la contraseña es incorrecta (401)", async () => {
    const res = await request(app)
      .post("/usuarios/login")
      .send({
        correo: correoPrueba,
        contrasena: "ClaveErronea999",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Credenciales inválidas");
  });

  it("POST /usuarios/login - Debería fallar si el correo no está registrado (401)", async () => {
    const res = await request(app)
      .post("/usuarios/login")
      .send({
        correo: "inexistente@ejemplo.com",
        contrasena: "ClaveSegura123",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Credenciales inválidas");
  });

  it("POST /usuarios/login - Debería fallar si faltan datos requeridos (400)", async () => {
    const res = await request(app)
      .post("/usuarios/login")
      .send({
        correo: correoPrueba,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Correo y contraseña son obligatorios");
  });

  // --- 3. Pruebas de Protección de Rutas (Middleware verificarAuth) ---

  it("GET /usuarios - Debería denegar acceso con 401 si no se envía token de autenticación", async () => {
    const res = await request(app).get("/usuarios");
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Token de autenticación no proporcionado");
  });

  it("GET /usuarios - Debería denegar acceso con 401 si el formato del header no es 'Bearer <token>'", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", "TokenInvalidoSinBearer");
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Formato de token inválido");
  });

  it("GET /usuarios - Debería rechazar con 403 un token alterado o inválido", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tokenfalso.firmafalsa");
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Token inválido o alterado");
  });

  it("GET /usuarios - Debería autorizar y obtener el listado con un token válido (200)", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${tokenCliente}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /usuarios/perfil - Debería retornar el perfil del usuario autenticado a partir de su JWT (200)", async () => {
    const res = await request(app)
      .get("/usuarios/perfil")
      .set("Authorization", `Bearer ${tokenCliente}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(usuarioCreadoId);
    expect(res.body.correo).toBe(correoPrueba);
    expect(res.body.contrasena).toBeUndefined();
  });

  it("GET /usuarios/:id - Debería obtener el usuario por ID con token válido (200)", async () => {
    const res = await request(app)
      .get(`/usuarios/${usuarioCreadoId}`)
      .set("Authorization", `Bearer ${tokenCliente}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(usuarioCreadoId);
    expect(res.body.correo).toBe(correoPrueba);
  });

  // --- 4. Pruebas de RegEx y Validaciones de Entrada ---

  it("POST /usuarios [RegEx] - Debería fallar si el correo no tiene formato válido (400)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .send({
        nombre: "Juan",
        correo: "correo-invalido-sin-arroba",
        contrasena: "ClaveSegura123",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("formato del correo electrónico no es válido");
  });

  it("POST /usuarios [RegEx] - Debería fallar si el nombre contiene números o caracteres inválidos (400)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .send({
        nombre: "Juan123",
        correo: "juan@ejemplo.com",
        contrasena: "ClaveSegura123",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("solo debe contener letras");
  });

  it("POST /usuarios [RegEx] - Debería fallar si la contraseña no cumple con la complejidad requerida (400)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .send({
        nombre: "Juan",
        correo: "juan_seguro@ejemplo.com",
        contrasena: "facil", // menos de 8 caracteres, sin mayúscula ni número
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("al menos 8 caracteres");
  });

  it("POST /usuarios - Debería fallar al intentar registrar un correo duplicado (409)", async () => {
    const usuarioDuplicado = {
      nombre: "Duplicado",
      correo: correoPrueba,
      contrasena: "ClaveSegura123",
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

  it("POST /usuarios - Debería fallar si se proporciona un rol inválido (400)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .send({
        nombre: "Test Rol",
        correo: "test_rol@ejemplo.com",
        contrasena: "ClaveSegura123",
        rol: "superadmin", // rol inválido
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("El rol proporcionado no es válido. Debe ser 'cliente' o 'admin'");
  });

  // --- 5. Pruebas de Actualización (PUT) ---

  it("PUT /usuarios/:id - Debería denegar actualización sin token (401)", async () => {
    const res = await request(app)
      .put(`/usuarios/${usuarioCreadoId}`)
      .send({ nombre: "Intento Sin Token" });

    expect(res.status).toBe(401);
  });

  it("PUT /usuarios/:id [Seguridad BOLA] - Debería impedir con 403 que un cliente modifique la cuenta de otro usuario", async () => {
    const res = await request(app)
      .put(`/usuarios/${adminTemporalId}`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({ nombre: "Intento Modificar Ajeno" });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("solo puedes modificar tu propia cuenta");
  });

  it("PUT /usuarios/:id - Debería actualizar los datos del propio usuario con token válido (200)", async () => {
    expect(usuarioCreadoId).toBeDefined();

    const cambios = {
      nombre: "Carlos Actualizado",
      apellido: "Gomez Perez",
    };

    const res = await request(app)
      .put(`/usuarios/${usuarioCreadoId}`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send(cambios);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario actualizado correctamente");
    expect(res.body.usuario.nombre).toBe("Carlos Actualizado");
    expect(res.body.usuario.apellido).toBe("Gomez Perez");
  });

  it("PUT /usuarios/:id [RegEx] - Debería fallar al actualizar con un formato de correo inválido (400)", async () => {
    expect(usuarioCreadoId).toBeDefined();

    const res = await request(app)
      .put(`/usuarios/${usuarioCreadoId}`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({ correo: "correo_invalido" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("formato del correo electrónico no es válido");
  });

  // --- 6. Pruebas de Autorización y Roles (DELETE / soloAdmin) ---

  it("DELETE /usuarios/:id - Debería rechazar la eliminación si el usuario no tiene rol 'admin' (403)", async () => {
    expect(usuarioCreadoId).toBeDefined();

    const res = await request(app)
      .delete(`/usuarios/${usuarioCreadoId}`)
      .set("Authorization", `Bearer ${tokenCliente}`); // Rol: cliente

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("se requieren privilegios de administrador");
  });

  it("DELETE /usuarios/:id - Debería permitir la eliminación cuando el usuario tiene rol 'admin' (200)", async () => {
    expect(usuarioCreadoId).toBeDefined();

    const res = await request(app)
      .delete(`/usuarios/${usuarioCreadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`); // Rol: admin

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario eliminado correctamente");
    expect(res.body.usuario.id).toBe(usuarioCreadoId);
  });

  it("GET /usuarios/:id - Debería retornar 404 para el usuario recién eliminado", async () => {
    const res = await request(app)
      .get(`/usuarios/${usuarioCreadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Usuario no encontrado");
  });
});
