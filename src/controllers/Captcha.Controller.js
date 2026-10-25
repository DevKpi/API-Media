import crypto from "crypto";
import Escena from "../models/Escena.model.js";
import Desafio from "../models/Desafio.model.js";

const DIFICULTADES_VALIDAS = ["facil", "medio", "dificil"];

// Función auxiliar para normalizar texto (remueve tildes, mayúsculas, signos y espacios extras)
function normalizarTexto(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Cálculo de distancia de Levenshtein para tolerancia a errores tipográficos leves
function calcularSimilitud(a, b) {
  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;

  const matriz = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matriz[i][0] = i;
  for (let j = 0; j <= b.length; j++) matriz[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,
        matriz[i][j - 1] + 1,
        matriz[i - 1][j - 1] + costo
      );
    }
  }

  const distancia = matriz[a.length][b.length];
  const longitudMaxima = Math.max(a.length, b.length);
  return (longitudMaxima - distancia) / longitudMaxima;
}

class CaptchaController {
  // Generar un nuevo desafío CAPTCHA aleatorio
  static async generarDesafio(req, res) {
    try {
      const { dificultad } = req.query;

      if (dificultad !== undefined && !DIFICULTADES_VALIDAS.includes(dificultad)) {
        return res.status(400).json({
          message: "La dificultad proporcionada no es válida. Debe ser 'facil', 'medio' o 'dificil'",
        });
      }

      // Limpiar desafíos pendientes vencidos en segundo plano
      await Desafio.limpiarExpirados();

      const escena = await Escena.obtenerAleatoria(dificultad);
      if (!escena) {
        return res.status(404).json({
          message: "No se encontraron escenas disponibles para generar el desafío",
        });
      }

      const id = crypto.randomUUID();
      const token = `tok_${crypto.randomBytes(24).toString("hex")}`;

      // Plazo de expiración: 10 minutos
      const expiraEn = new Date(Date.now() + 10 * 60 * 1000);

      await Desafio.crear({
        id,
        token,
        escena_id: escena.id,
        respuesta_esperada: escena.subtitulo_texto,
        expira_en: expiraEn,
      });

      const host = req.get("host");
      const protocolo = req.protocol;

      res.status(201).json({
        message: "Desafío CAPTCHA generado con éxito",
        desafio_id: id,
        token,
        imagen_url: `${protocolo}://${host}/imagenes/${escena.imagen_de_escena}`,
        dificultad: escena.dificultad,
        obra: escena.obra_titulo,
        expira_en: expiraEn.toISOString(),
        instrucciones:
          "Escribe el texto del subtítulo visible en la imagen para validar que eres humano.",
      });
    } catch (error) {
      console.error("Error al generar desafío CAPTCHA:", error);
      res.status(500).json({ message: "Error interno del servidor al generar el desafío" });
    }
  }

  // Validar la respuesta enviada por el usuario para un desafío
  static async validarDesafio(req, res) {
    try {
      const { token, respuesta } = req.body || {};

      if (!token || typeof token !== "string" || !token.trim()) {
        return res.status(400).json({ message: "El token del desafío es obligatorio" });
      }

      if (respuesta === undefined || typeof respuesta !== "string" || !respuesta.trim()) {
        return res
          .status(400)
          .json({ message: "Debe ingresar una respuesta para validar el desafío" });
      }

      const tokenLimpio = token.trim();
      const desafio = await Desafio.obtenerPorToken(tokenLimpio);

      if (!desafio) {
        return res.status(404).json({ message: "Desafío no encontrado o token inválido" });
      }

      if (desafio.estado === "resuelto") {
        return res.status(400).json({
          valido: false,
          message: "Este desafío ya ha sido resuelto anteriormente",
        });
      }

      const ahora = new Date();
      if (desafio.estado === "expirado" || new Date(desafio.expira_en) < ahora) {
        if (desafio.estado !== "expirado") {
          await Desafio.actualizarEstado(tokenLimpio, "expirado");
        }
        return res.status(400).json({
          valido: false,
          message: "El desafío ha expirado. Solicite un nuevo desafío.",
        });
      }

      // Normalizar cadenas para comparación tolerante
      const normalizadaUsuario = normalizarTexto(respuesta);
      const normalizadaEsperada = normalizarTexto(desafio.respuesta_esperada);

      const similitud = calcularSimilitud(normalizadaUsuario, normalizadaEsperada);
      const esCorrecta = normalizadaUsuario === normalizadaEsperada || similitud >= 0.85;

      if (esCorrecta) {
        await Desafio.actualizarEstado(tokenLimpio, "resuelto");
        return res.status(200).json({
          valido: true,
          message: "Verificación humana exitosa",
          desafio_id: desafio.id,
          token: desafio.token,
        });
      }

      return res.status(400).json({
        valido: false,
        message: "La respuesta no coincide con el subtítulo de la escena. Intente nuevamente.",
      });
    } catch (error) {
      console.error("Error al validar desafío CAPTCHA:", error);
      res.status(500).json({ message: "Error interno del servidor al validar el desafío" });
    }
  }
}

export { normalizarTexto, calcularSimilitud };
export default CaptchaController;
