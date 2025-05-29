const Aplicacion = require("./aplicacion.model");
const Oferta = require("../Ofertas/oferta.model");
const Candidato = require("../Candidatos/candidato.model");

// Obtener todas las aplicaciones
exports.obtenerAplicaciones = async (req, res) => {
  try {
    const aplicaciones = await Aplicacion.find()
      .populate("ofertaId")
      .populate("candidatoId");
    res.json(aplicaciones);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener aplicaciones", detalle: error.message });
  }
};

// Obtener una aplicación por ID
exports.obtenerAplicacionPorId = async (req, res) => {
  try {
    const aplicacion = await Aplicacion.findById(req.params.id)
      .populate("ofertaId")
      .populate("candidatoId");

    if (!aplicacion) {
      return res.status(404).json({ error: "Aplicación no encontrada" });
    }

    res.json(aplicacion);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener la aplicación",
        detalle: error.message,
      });
  }
};

// Crear una nueva aplicación
exports.crearAplicacion = async (req, res) => {
  try {
    const { candidatoId, ofertaId } = req.body;

    const aplicacionExistente = await Aplicacion.findOne({ candidatoId, ofertaId });

    if (aplicacionExistente) {
      return res.status(400).json({
        error: "Ya has aplicado a esta oferta anteriormente."
      });
    }

    const nuevaAplicacion = new Aplicacion({
      ...req.body,
      fecha: req.body.fecha || new Date(),
      seleccionado: req.body.seleccionado || false,
    });

    const aplicacionGuardada = await nuevaAplicacion.save();

    await Oferta.findByIdAndUpdate(ofertaId, {
      $push: { aplicaciones: aplicacionGuardada._id },
    });

    await Candidato.findByIdAndUpdate(candidatoId, {
      $push: { aplicaciones: aplicacionGuardada._id },
    });

    res.status(201).json(aplicacionGuardada);
  } catch (error) {
    res.status(500).json({
      error: "Error al crear aplicación",
      detalle: error.message,
    });
  }
};


// Actualizar una aplicación
exports.actualizarAplicacion = async (req, res) => {
  try {
    const aplicacionActualizada = await Aplicacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!aplicacionActualizada) {
      return res.status(404).json({ error: "Aplicación no encontrada" });
    }

    res.json(aplicacionActualizada);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al actualizar aplicación",
        detalle: error.message,
      });
  }
};

// Eliminar una aplicación
exports.eliminarAplicacion = async (req, res) => {
  try {

    
    const aplicacion = await Aplicacion.findById(req.params.id);

    if (!aplicacion) {
      return res.status(404).json({ error: "Aplicación no encontrada" });
    }

    
    await Oferta.findByIdAndUpdate(aplicacion.ofertaId, {
      $pull: { aplicaciones: req.params.id },
    });

    await Candidato.findByIdAndUpdate(aplicacion.candidatoId, {
      $pull: { aplicaciones: req.params.id },
    });

    await Aplicacion.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Aplicación eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar aplicación", detalle: error.message });
  }
};
