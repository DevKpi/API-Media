import { verificarToken } from "../utils/jwt.js";

/**
 * Middleware para verificar la validez del JWT en el header Authorization.
 * Espera el formato: Authorization: Bearer <token>
 */
export const verificarAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "Token de autenticación no proporcionado",
    });
  }

  const partes = authHeader.trim().split(" ");
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      message: "Formato de token inválido. Formato esperado: Bearer <token>",
    });
  }

  const token = partes[1];

  try {
    const payload = verificarToken(token);
    req.usuario = payload;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado. Inicie sesión nuevamente",
      });
    }

    return res.status(403).json({
      message: "Token inválido o alterado",
    });
  }
};

/**
 * Middleware opcional de autenticación para rutas públicas con vista enriquecida para administradores.
 * Si se envía un Bearer token válido, inyecta `req.usuario`; de lo contrario continúa como visitante público (`req.usuario = null`).
 */
export const verificarAuthOpcional = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    req.usuario = null;
    return next();
  }

  const partes = authHeader.trim().split(" ");
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    req.usuario = null;
    return next();
  }

  try {
    req.usuario = verificarToken(partes[1]);
  } catch {
    req.usuario = null;
  }

  next();
};

/**
 * Middleware para restringir acceso exclusivamente a usuarios con rol 'admin'.
 * Requiere que se haya ejecutado verificarAuth previamente.
 */
export const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado: se requieren privilegios de administrador",
    });
  }

  next();
};

/**
 * Middleware para permitir la acción únicamente al titular de la cuenta (:id) o a un administrador.
 * Requiere que se haya ejecutado verificarAuth previamente.
 */
export const propietarioOAdmin = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "El ID proporcionado debe ser un número válido",
    });
  }

  if (!req.usuario || (req.usuario.rol !== "admin" && req.usuario.id !== id)) {
    return res.status(403).json({
      message:
        "Acceso denegado: solo puedes modificar tu propia cuenta o contar con privilegios de administrador",
    });
  }

  next();
};

/**
 * Middleware configurable para restringir acceso según una lista de roles permitidos.
 * @param  {...string} rolesPermitidos - Lista de roles permitidos (ej. 'admin', 'cliente')
 */
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        message: "Acceso denegado: rol no autorizado para realizar esta acción",
      });
    }
    next();
  };
};
