const ValoracionEmpleador = require("../ValoracionesEmpleador/valoracionEmpleador.model");
const EmpleadorEmpresa = require("../EmpleadoresEmpresa/empleadorEmpresa.model");
const EmpleadorParticular = require("../EmpleadoresParticular/empleadorParticular.model");

// Obtener todas las valoraciones
exports.obtenerValoraciones = async (req, res) => {
  try {
    const valoraciones = await ValoracionEmpleador.find()
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
    const valoracion = await ValoracionEmpleador.findById(req.params.id)
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

// Obtener valoraciones por empleador
exports.obtenerValoracionesPorEmpleador = async (req, res) => {
  try {
    const valoraciones = await ValoracionEmpleador.find({
      empleadorId: req.params.empleadorId,
    }).populate("candidatoId");

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
    const nuevaValoracion = new ValoracionEmpleador({
      ...req.body,
      fecha: req.body.fecha,
    });

    const valoracionGuardada = await nuevaValoracion.save();

    const esEmpresa = await EmpleadorEmpresa.findById(
      valoracionGuardada.empleadorId
    );

    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(valoracionGuardada.empleadorId, {
        $push: { valoraciones: valoracionGuardada._id },
      });
    } else {
      await EmpleadorParticular.findByIdAndUpdate(
        valoracionGuardada.empleadorId,
        { $push: { valoraciones: valoracionGuardada._id } }
      );
    }

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
    const valoracionActualizada = await ValoracionEmpleador.findByIdAndUpdate(
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
    const valoracion = await ValoracionEmpleador.findById(req.params.id);

    if (!valoracion) {
      return res.status(404).json({ error: "Valoración no encontrada" });
    }

    // Actualizar el empleador para quitar la referencia a esta valoración
    const esEmpresa = await EmpleadorEmpresa.findOne({
      valoraciones: req.params.id,
    });

    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(valoracion.empleadorId, {
        $pull: { valoraciones: req.params.id },
      });
    } else {
      await EmpleadorParticular.findByIdAndUpdate(valoracion.empleadorId, {
        $pull: { valoraciones: req.params.id },
      });
    }

    // Eliminar la valoración
    await ValoracionEmpleador.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Valoración eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar valoración", detalle: error.message });
  }
};
