import Escena from "../models/Escena.model.js";

class EscenaController {
  // Obtener catálogo de escenas con filtros opcionales (obra_id, dificultad)
  static async obtenerEscenas(req, res) {
    try {
      const { obra_id, dificultad } = req.query;

      const escenas = await Escena.obtenerTodas({
        obra_id: obra_id ? parseInt(obra_id) : undefined,
        dificultad,
      });

      const host = req.get("host");
      const protocolo = req.protocol;

      const escenasFormateadas = escenas.map((e) => ({
        ...e,
        imagen_url: `${protocolo}://${host}/imagenes/${e.imagen_de_escena}`,
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "El ID proporcionado debe ser un número válido" });
      }

      const escena = await Escena.obtenerPorId(id);
      if (!escena) {
        return res.status(404).json({ message: "Escena no encontrada" });
      }

      const host = req.get("host");
      const protocolo = req.protocol;

      res.status(200).json({
        ...escena,
        imagen_url: `${protocolo}://${host}/imagenes/${escena.imagen_de_escena}`,
      });
    } catch (error) {
      console.error("Error al obtener escena:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener la escena" });
    }
  }
}

export default EscenaController;
