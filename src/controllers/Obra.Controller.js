import Obra from "../models/Obra.model.js";

class ObraController {
  // Obtener listado de todas las obras registradas
  static async obtenerObras(req, res) {
    try {
      const obras = await Obra.obtenerTodas();
      res.status(200).json(obras);
    } catch (error) {
      console.error("Error al obtener obras:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener las obras" });
    }
  }

  // Obtener el detalle de una obra por ID junto con sus escenas asociadas
  static async obtenerObraPorId(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "El ID proporcionado debe ser un número válido" });
      }

      const obra = await Obra.obtenerPorId(id);
      if (!obra) {
        return res.status(404).json({ message: "Obra no encontrada" });
      }

      const host = req.get("host");
      const protocolo = req.protocol;
      const esAdmin = req.usuario && req.usuario.rol === "admin";

      const escenasFormateadas = obra.escenas.map(({ subtitulo_texto, ...resto }) => ({
        ...resto,
        ...(esAdmin ? { subtitulo_texto } : {}),
        imagen_url: `${protocolo}://${host}/imagenes/${resto.imagen_de_escena}`,
      }));

      res.status(200).json({
        ...obra,
        escenas: escenasFormateadas,
      });
    } catch (error) {
      console.error("Error al obtener obra:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener la obra" });
    }
  }
}

export default ObraController;
