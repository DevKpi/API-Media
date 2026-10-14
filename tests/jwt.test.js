import { describe, it, expect } from "vitest";
import { firmarToken, verificarToken } from "../src/utils/jwt.js";
import { verificarAuth, soloAdmin, permitirRoles } from "../src/middlewares/auth.js";

describe("Pruebas Unitarias - Módulo JWT y Middlewares de Autenticación", () => {
  it("Debería firmar y verificar un token exitosamente", () => {
    const payload = { id: 10, correo: "usuario@ejemplo.com", rol: "cliente" };
    const token = firmarToken(payload);

    expect(typeof token).toBe("string");

    const decoded = verificarToken(token);
    expect(decoded.id).toBe(10);
    expect(decoded.correo).toBe("usuario@ejemplo.com");
    expect(decoded.rol).toBe("cliente");
    expect(decoded.exp).toBeDefined();
  });

  it("Debería lanzar error al verificar un token inválido", () => {
    expect(() => verificarToken("token.invalido.falso")).toThrow();
  });

  it("Debería lanzar TokenExpiredError cuando el token ha expirado", async () => {
    const tokenCorto = firmarToken({ id: 5 }, { expiresIn: "1ms" });

    // Esperar a que el token expire
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(() => verificarToken(tokenCorto)).toThrowError();
  });

  it("verificarAuth debería responder 401 cuando el token está expirado", async () => {
    const tokenExpirado = firmarToken({ id: 1 }, { expiresIn: "1ms" });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const req = {
      headers: {
        authorization: `Bearer ${tokenExpirado}`,
      },
    };

    let statusCode = null;
    let jsonBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        jsonBody = body;
        return this;
      },
    };

    let nextLlamado = false;
    const next = () => {
      nextLlamado = true;
    };

    verificarAuth(req, res, next);

    expect(nextLlamado).toBe(false);
    expect(statusCode).toBe(401);
    expect(jsonBody.message).toContain("Token expirado");
  });

  it("soloAdmin debería permitir el paso si el usuario es admin", () => {
    const req = { usuario: { id: 1, rol: "admin" } };
    let nextLlamado = false;
    const next = () => {
      nextLlamado = true;
    };

    soloAdmin(req, {}, next);
    expect(nextLlamado).toBe(true);
  });

  it("soloAdmin debería denegar el paso con 403 si el usuario es cliente", () => {
    const req = { usuario: { id: 2, rol: "cliente" } };
    let statusCode = null;
    let jsonBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        jsonBody = body;
        return this;
      },
    };

    let nextLlamado = false;
    const next = () => {
      nextLlamado = true;
    };

    soloAdmin(req, res, next);
    expect(nextLlamado).toBe(false);
    expect(statusCode).toBe(403);
    expect(jsonBody.message).toContain("se requieren privilegios de administrador");
  });

  it("permitirRoles debería permitir accesos configurados y denegar no autorizados", () => {
    const middleware = permitirRoles("admin", "moderador");

    // Caso permitido
    const reqPermitido = { usuario: { id: 3, rol: "moderador" } };
    let next1 = false;
    middleware(reqPermitido, {}, () => {
      next1 = true;
    });
    expect(next1).toBe(true);

    // Caso denegado
    const reqDenegado = { usuario: { id: 4, rol: "cliente" } };
    let statusCode = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json() {
        return this;
      },
    };
    let next2 = false;
    middleware(reqDenegado, res, () => {
      next2 = true;
    });
    expect(next2).toBe(false);
    expect(statusCode).toBe(403);
  });
});
