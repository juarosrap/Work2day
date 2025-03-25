const EmpleadorParticular = require("./empleadorParticular.model");
const Oferta = require("../Ofertas/oferta.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const Candidato = require("../Candidatos/candidato.model");
const ValoracionEmpleador = require("../ValoracionesEmpleador/valoracionEmpleador.model");

// Obtener todos los empleadores particulares
exports.obtenerEmpleadoresParticular = async (req, res) => {
  try {
    const empleadores = await EmpleadorParticular.find();
    res.json(empleadores);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener empleadores", detalle: error.message });
  }
};

// Obtener un empleador particular por ID
exports.obtenerEmpleadorParticularPorId = async (req, res) => {
  try {
    const empleador = await EmpleadorParticular.findById(req.params.id)
      .populate("ofertas")
      .populate("valoraciones");

    if (!empleador) {
      return res
        .status(404)
        .json({ error: "Empleador particular no encontrado" });
    }

    res.json(empleador);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el empleador", detalle: error.message });
  }
};

// Crear un nuevo empleador particular
exports.crearEmpleadorParticular = async (req, res) => {
  try {
    const nuevoEmpleador = new EmpleadorParticular(req.body);
    const empleadorGuardado = await nuevoEmpleador.save();
    res.status(201).json(empleadorGuardado);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al crear empleador particular",
        detalle: error.message,
      });
  }
};

// Actualizar un empleador particular
exports.actualizarEmpleadorParticular = async (req, res) => {
  try {
    const empleadorActualizado = await EmpleadorParticular.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!empleadorActualizado) {
      return res
        .status(404)
        .json({ error: "Empleador particular no encontrado" });
    }

    res.json(empleadorActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar empleador", detalle: error.message });
  }
};

// Eliminar un empleador particular
exports.eliminarEmpleadorParticular = async (req, res) => {
  try {
    const empleador = await EmpleadorParticular.findById(req.params.id);

    if (!empleador) {
      return res
        .status(404)
        .json({ error: "Empleador particular no encontrado" });
    }

    // Obtener todos los IDs de ofertas asociadas
    const ofertaIds = empleador.ofertas;

    // Eliminar valoraciones del empleador
    await ValoracionEmpleador.deleteMany({ empleadorId: req.params.id });

    // Eliminar aplicaciones relacionadas con las ofertas
    for (const ofertaId of ofertaIds) {
      const aplicaciones = await Aplicacion.find({ ofertaId });

      // Actualizar candidatos para quitar referencias a las aplicaciones
      for (const aplicacion of aplicaciones) {
        await Candidato.findByIdAndUpdate(aplicacion.candidatoId, {
          $pull: { aplicaciones: aplicacion._id },
        });
      }

      // Eliminar aplicaciones
      await Aplicacion.deleteMany({ ofertaId });
    }

    // Eliminar ofertas
    await Oferta.deleteMany({ _id: { $in: ofertaIds } });

    // Finalmente eliminar el empleador
    await EmpleadorParticular.findByIdAndDelete(req.params.id);

    res.json({
      mensaje:
        "Empleador particular y sus datos relacionados eliminados correctamente",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al eliminar empleador particular",
        detalle: error.message,
      });
  }
};
