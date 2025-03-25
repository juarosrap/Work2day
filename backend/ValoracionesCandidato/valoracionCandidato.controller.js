const ValoracionCandidato = require("../ValoracionesCandidato/valoracionCandidato.model");
const Candidato = require("../Candidatos/candidato.model");

// Obtener todas las valoraciones
exports.obtenerValoraciones = async (req, res) => {
  try {
    const valoraciones = await ValoracionCandidato.find()
      .populate("candidatoId")
      .populate("empleadorId");

    res.json(valoraciones);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener valoraciones", detalle: error.message });
  }
};

// Obtener una valoración por ID
exports.obtenerValoracionPorId = async (req, res) => {
  try {
    const valoracion = await ValoracionCandidato.findById(req.params.id)
      .populate("candidatoId")
      .populate("empleadorId");

    if (!valoracion) {
      return res.status(404).json({ error: "Valoración no encontrada" });
    }

    res.json(valoracion);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener la valoración",
        detalle: error.message,
      });
  }
};

// Obtener valoraciones por candidato
exports.obtenerValoracionesPorCandidato = async (req, res) => {
  try {
    const valoraciones = await ValoracionCandidato.find({
      candidatoId: req.params.candidatoId,
    }).populate("empleadorId");

    res.json(valoraciones);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener valoraciones", detalle: error.message });
  }
};

// Crear una nueva valoración
exports.crearValoracion = async (req, res) => {
  try {
    const nuevaValoracion = new ValoracionCandidato({
      ...req.body,
      fecha: req.body.fecha || new Date(),
    });

    const valoracionGuardada = await nuevaValoracion.save();

    // Actualizar el candidato con esta valoración
    await Candidato.findByIdAndUpdate(valoracionGuardada.candidatoId, {
      $push: { valoraciones: valoracionGuardada._id },
    });

    res.status(201).json(valoracionGuardada);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear valoración", detalle: error.message });
  }
};

// Actualizar una valoración
exports.actualizarValoracion = async (req, res) => {
  try {
    const valoracionActualizada = await ValoracionCandidato.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!valoracionActualizada) {
      return res.status(404).json({ error: "Valoración no encontrada" });
    }

    res.json(valoracionActualizada);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al actualizar valoración",
        detalle: error.message,
      });
  }
};

// Eliminar una valoración
exports.eliminarValoracion = async (req, res) => {
  try {
    const valoracion = await ValoracionCandidato.findById(req.params.id);

    if (!valoracion) {
      return res.status(404).json({ error: "Valoración no encontrada" });
    }

    // Actualizar el candidato para quitar la referencia a esta valoración
    await Candidato.findByIdAndUpdate(valoracion.candidatoId, {
      $pull: { valoraciones: req.params.id },
    });

    // Eliminar la valoración
    await ValoracionCandidato.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Valoración eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar valoración", detalle: error.message });
  }
};
