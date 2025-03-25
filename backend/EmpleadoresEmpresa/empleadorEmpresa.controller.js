const EmpleadorEmpresa = require("./empleadorEmpresa.model");
const Oferta = require("../Ofertas/oferta.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const Candidato = require("../Candidatos/candidato.model");
const ValoracionEmpleador = require("../ValoracionesEmpleador/valoracionEmpleador.model");

// Obtener todos los empleadores empresa
exports.obtenerEmpleadoresEmpresa = async (req, res) => {
  try {
    const empleadores = await EmpleadorEmpresa.find();
    res.json(empleadores);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener empleadores", detalle: error.message });
  }
};

// Obtener un empleador empresa por ID
exports.obtenerEmpleadorEmpresaPorId = async (req, res) => {
  try {
    const empleador = await EmpleadorEmpresa.findById(req.params.id)
      .populate("ofertas")
      .populate("valoraciones");

    if (!empleador) {
      return res.status(404).json({ error: "Empleador empresa no encontrado" });
    }

    res.json(empleador);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el empleador", detalle: error.message });
  }
};

// Crear un nuevo empleador empresa
exports.crearEmpleadorEmpresa = async (req, res) => {
  try {
    const nuevoEmpleador = new EmpleadorEmpresa(req.body);
    const empleadorGuardado = await nuevoEmpleador.save();
    res.status(201).json(empleadorGuardado);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al crear empleador empresa",
        detalle: error.message,
      });
  }
};

// Actualizar un empleador empresa
exports.actualizarEmpleadorEmpresa = async (req, res) => {
  try {
    const empleadorActualizado = await EmpleadorEmpresa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!empleadorActualizado) {
      return res.status(404).json({ error: "Empleador empresa no encontrado" });
    }

    res.json(empleadorActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar empleador", detalle: error.message });
  }
};

// Eliminar un empleador empresa
exports.eliminarEmpleadorEmpresa = async (req, res) => {
  try {
    const empleador = await EmpleadorEmpresa.findById(req.params.id);

    if (!empleador) {
      return res.status(404).json({ error: "Empleador empresa no encontrado" });
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
    await EmpleadorEmpresa.findByIdAndDelete(req.params.id);

    res.json({
      mensaje:
        "Empleador empresa y sus datos relacionados eliminados correctamente",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al eliminar empleador empresa",
        detalle: error.message,
      });
  }
};
