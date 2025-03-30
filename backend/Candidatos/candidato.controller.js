const Candidato = require("./candidato.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const ValoracionCandidato = require("../ValoracionesCandidato/valoracionCandidato.model");
const bcrypt = require('bcryptjs');

// Obtener todos los candidatos
exports.obtenerCandidatos = async (req, res) => {
  try {
    const candidatos = await Candidato.find();
    res.json(candidatos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener candidatos", detalle: error.message });
  }
};

// Obtener un candidato por ID
exports.obtenerCandidatoPorId = async (req, res) => {
  try {
    const candidato = await Candidato.findById(req.params.id)
      .populate("aplicaciones")
      .populate("valoraciones");

    if (!candidato) {
      return res.status(404).json({ error: "Candidato no encontrado" });
    }

    res.json(candidato);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el candidato", detalle: error.message });
  }
};

// Crear un nuevo candidato
exports.crearCandidato = async (req, res) => {
  try {
    
    const { contrasena, correo, ...otrosDatos } = req.body;

    const candidatoExistente = await Candidato.findOne({ correo });

    if (candidatoExistente) {
      return res
        .status(400)
        .json({ error: "Ya existe un candidato con ese correo electrónico" });
    }
    
    // Verificar que se proporciona una contraseña
    if (!contrasena) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }
    
    const passwordHash = await bcrypt.hash(contrasena, 10);
    
    // Crear un nuevo objeto candidato con la contraseña encriptada
    const nuevoCandidato = new Candidato({
      ...otrosDatos,
      correo,
      contrasena: passwordHash
    });
    
    const candidatoGuardado = await nuevoCandidato.save({
      runValidators: true,
    });

    res.status(201).json(candidatoGuardado);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear candidato", detalle: error.message });
  }
};

// Actualizar un candidato
exports.actualizarCandidato = async (req, res) => {
  try {
    const candidatoActualizado = await Candidato.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!candidatoActualizado) {
      return res.status(404).json({ error: "Candidato no encontrado" });
    }

    res.json(candidatoActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar candidato", detalle: error.message });
  }
};

// Eliminar un candidato
exports.eliminarCandidato = async (req, res) => {
  try {
    const candidatoEliminado = await Candidato.findByIdAndDelete(req.params.id);

    if (!candidatoEliminado) {
      return res.status(404).json({ error: "Candidato no encontrado" });
    }

    // Eliminar aplicaciones y valoraciones asociadas
    await Aplicacion.deleteMany({ candidatoId: req.params.id });
    await ValoracionCandidato.deleteMany({ candidatoId: req.params.id });

    res.json({ mensaje: "Candidato eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar candidato", detalle: error.message });
  }
};
