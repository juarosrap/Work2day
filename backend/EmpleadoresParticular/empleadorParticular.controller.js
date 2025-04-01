const EmpleadorParticular = require("./empleadorParticular.model");
const Oferta = require("../Ofertas/oferta.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const Candidato = require("../Candidatos/candidato.model");
const ValoracionEmpleador = require("../ValoracionesEmpleador/valoracionEmpleador.model");
const bcrypt = require("bcryptjs");

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
    const { contrasena, correo, ...otrosDatos } = req.body;

    const correoExistente = await EmpleadorParticular.findOne({correo})

    if(correoExistente){
      return res
        .status(400)
        .json({ error: "Ya existe un empleador con ese correo electrónico" });
    }
  
    if (!contrasena) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    if (typeof contrasena !== "string") {
      return res
        .status(400)
        .json({ error: "La contraseña debe ser un string" });
    }

    if (contrasena.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const passwordHash = await bcrypt.hash(contrasena, 10);

    const nuevoEmpleador = new Candidato({
      ...otrosDatos,
      correo,
      contrasena: passwordHash,
    });

    const empleadorGuardado = await nuevoEmpleador.save({
      runValidators: true,
    });

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

    const ofertaIds = empleador.ofertas;

    await ValoracionEmpleador.deleteMany({ empleadorId: req.params.id });

    for (const ofertaId of ofertaIds) {
      const aplicaciones = await Aplicacion.find({ ofertaId });

      for (const aplicacion of aplicaciones) {
        await Candidato.findByIdAndUpdate(aplicacion.candidatoId, {
          $pull: { aplicaciones: aplicacion._id },
        });
      }

      await Aplicacion.deleteMany({ ofertaId });
    }

    await Oferta.deleteMany({ _id: { $in: ofertaIds } });

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
