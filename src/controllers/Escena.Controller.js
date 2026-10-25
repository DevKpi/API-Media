import Escena from "../models/Escena.model.js";

const DIFICULTADES_VALIDAS = ["facil", "medio", "dificil"];

class EscenaController {
  // Obtener catálogo de escenas con filtros opcionales (obra_id, dificultad)
  static async obtenerEscenas(req, res) {
    try {
      const { obra_id, dificultad } = req.query;

      let obraIdNumerico = undefined;
      if (obra_id !== undefined) {
        obraIdNumerico = Number(obra_id);
        if (!Number.isInteger(obraIdNumerico) || obraIdNumerico <= 0) {
          return res
            .status(400)
            .json({ message: "El parámetro obra_id debe ser un número válido" });
        }
      }

      if (dificultad !== undefined && !DIFICULTADES_VALIDAS.includes(dificultad)) {
        return res.status(400).json({
          message: "La dificultad proporcionada no es válida. Debe ser 'facil', 'medio' o 'dificil'",
        });
      }

      const escenas = await Escena.obtenerTodas({
        obra_id: obraIdNumerico,
        dificultad,
      });

      const host = req.get("host");
      const protocolo = req.protocol;
      const esAdmin = req.usuario && req.usuario.rol === "admin";

      const escenasFormateadas = escenas.map(({ subtitulo_texto, ...resto }) => ({
        ...resto,
        ...(esAdmin ? { subtitulo_texto } : {}),
        imagen_url: `${protocolo}://${host}/imagenes/${resto.imagen_de_escena}`,
      }));

      res.status(200).json(escenasFormateadas);
    } catch (error) {
      console.error("Error al obtener escenas:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener las escenas" });
    }
  }

  // Obtener el detalle de una escena por su ID
  static async obtenerEscenaPorId(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "El ID proporcionado debe ser un número válido" });
      }

      const escena = await Escena.obtenerPorId(id);
      if (!escena) {
        return res.status(404).json({ message: "Escena no encontrada" });
      }

      const host = req.get("host");
      const protocolo = req.protocol;
      const esAdmin = req.usuario && req.usuario.rol === "admin";
      const { subtitulo_texto, ...resto } = escena;

      res.status(200).json({
        ...resto,
        ...(esAdmin ? { subtitulo_texto } : {}),
        imagen_url: `${protocolo}://${host}/imagenes/${escena.imagen_de_escena}`,
      });
    } catch (error) {
      console.error("Error al obtener escena:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener la escena" });
    }
  }
}

export default EscenaController;
