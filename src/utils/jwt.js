import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN = "2h" } = process.env;

if (!JWT_SECRET) {
  throw new Error("Falta definir la variable JWT_SECRET en el archivo de entorno (.env)");
}

/**
 * Genera un token JWT firmado con el payload provisto.
 * @param {object} payload - Información a incluir en el token (ej. id, correo, rol).
 * @param {object} [opciones={}] - Opciones adicionales para jwt.sign.
 * @returns {string} Token JWT firmado.
 */
export const firmarToken = (payload, opciones = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...opciones,
  });
};

/**
 * Valida un token JWT y retorna su contenido decodificado.
 * Lanza JsonWebTokenError o TokenExpiredError si es inválido o ha expirado.
 * @param {string} token - Token JWT a verificar.
 * @returns {object} Payload decodificado.
 */
export const verificarToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
