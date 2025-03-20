// api-routes.js o index.js
const express = require('express');
const router = express.Router();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const PORT = 5000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

// Importación de modelos
const Candidato = require('./models/candidato.model');
const Aplicacion = require('./models/aplicacion.model');
const EmpleadorEmpresa = require('./models/empleadorEmpresa.model');
const EmpleadorParticular = require('./models/empleadorParticular.model');
const Oferta = require('./models/oferta.model');
const ValoracionCandidato = require('./models/valoracionCandidato.model');
const ValoracionEmpleador = require('./models/valoracionEmpleador.model');


// Conexión a MongoDB
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000, 
  })
  .then(() => {
    console.log("🟢 Conectado a MongoDB");
    
    app.listen(PORT, () => {
      console.log("Servidor escuchando en puerto 5000");
    });
  })
  .catch((err) => {
    console.error("🔴 Error conectando a MongoDB:", err);
    process.exit(1); 
  });

// ------------------- Rutas para Candidatos -------------------

// Obtener todos los candidatos
router.get('/api/candidatos', async (req, res) => {
  try {
    const candidatos = await Candidato.find();
    res.json(candidatos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener candidatos', detalle: error.message });
  }
});

// Obtener un candidato por ID
router.get('/api/candidatos/:id', async (req, res) => {
  try {
    const candidato = await Candidato.findById(req.params.id)
      .populate('aplicaciones')
      .populate('valoraciones');

    if (!candidato) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    res.json(candidato);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el candidato', detalle: error.message });
  }
});

// Crear un nuevo candidato
router.post('/api/candidatos', async (req, res) => {
  try {
    const nuevoCandidato = new Candidato(req.body);
    const candidatoGuardado = await nuevoCandidato.save({
      runValidators: true,
    });
    
    res.status(201).json(candidatoGuardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear candidato', detalle: error.message });
  }
});

// Actualizar un candidato
router.put('/api/candidatos/:id', async (req, res) => {
  try {
    const candidatoActualizado = await Candidato.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!candidatoActualizado) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    res.json(candidatoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar candidato', detalle: error.message });
  }
});

// Eliminar un candidato
router.delete('/api/candidatos/:id', async (req, res) => {
  try {
    const candidatoEliminado = await Candidato.findByIdAndDelete(req.params.id);

    if (!candidatoEliminado) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    // También podríamos eliminar las aplicaciones y valoraciones asociadas
    await Aplicacion.deleteMany({ candidatoId: req.params.id });
    await ValoracionCandidato.deleteMany({ candidatoId: req.params.id });

    res.json({ mensaje: 'Candidato eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar candidato', detalle: error.message });
  }
});

// ------------------- Rutas para Aplicaciones -------------------

// Obtener todas las aplicaciones
router.get('/api/aplicaciones', async (req, res) => {
  try {
    const aplicaciones = await Aplicacion.find()
      .populate('ofertaId')
      .populate('candidatoId');
    res.json(aplicaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener aplicaciones', detalle: error.message });
  }
});

// Obtener una aplicación por ID
router.get('/api/aplicaciones/:id', async (req, res) => {
  try {
    const aplicacion = await Aplicacion.findById(req.params.id)
      .populate('ofertaId')
      .populate('candidatoId');

    if (!aplicacion) {
      return res.status(404).json({ error: 'Aplicación no encontrada' });
    }

    res.json(aplicacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la aplicación', detalle: error.message });
  }
});

// Crear una nueva aplicación
router.post('/api/aplicaciones', async (req, res) => {
  try {
    const nuevaAplicacion = new Aplicacion({
      ...req.body,
      fecha: req.body.fecha || new Date(),
      seleccionado: req.body.seleccionado || false
    });

    const aplicacionGuardada = await nuevaAplicacion.save();

    // Actualizar la oferta y el candidato con esta aplicación
    await Oferta.findByIdAndUpdate(
      aplicacionGuardada.ofertaId,
      { $push: { aplicaciones: aplicacionGuardada._id } }
    );

    await Candidato.findByIdAndUpdate(
      aplicacionGuardada.candidatoId,
      { $push: { aplicaciones: aplicacionGuardada._id } }
    );

    res.status(201).json(aplicacionGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear aplicación', detalle: error.message });
  }
});

// Actualizar una aplicación
router.put('/api/aplicaciones/:id', async (req, res) => {
  try {
    const aplicacionActualizada = await Aplicacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!aplicacionActualizada) {
      return res.status(404).json({ error: 'Aplicación no encontrada' });
    }

    res.json(aplicacionActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar aplicación', detalle: error.message });
  }
});

// Eliminar una aplicación
router.delete('/api/aplicaciones/:id', async (req, res) => {
  try {
    const aplicacion = await Aplicacion.findById(req.params.id);

    if (!aplicacion) {
      return res.status(404).json({ error: 'Aplicación no encontrada' });
    }

    // Eliminar la referencia de la aplicación en la oferta
    await Oferta.findByIdAndUpdate(
      aplicacion.ofertaId,
      { $pull: { aplicaciones: req.params.id } }
    );

    // Eliminar la referencia de la aplicación en el candidato
    await Candidato.findByIdAndUpdate(
      aplicacion.candidatoId,
      { $pull: { aplicaciones: req.params.id } }
    );

    // Eliminar la aplicación
    await Aplicacion.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Aplicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar aplicación', detalle: error.message });
  }
});

// ------------------- Rutas para EmpleadorEmpresa -------------------

// Obtener todos los empleadores empresa
router.get('/api/empleadores-empresa', async (req, res) => {
  try {
    const empleadores = await EmpleadorEmpresa.find();
    res.json(empleadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleadores', detalle: error.message });
  }
});

// Obtener un empleador empresa por ID
router.get('/api/empleadores-empresa/:id', async (req, res) => {
  try {
    const empleador = await EmpleadorEmpresa.findById(req.params.id)
      .populate('ofertas')
      .populate('valoraciones');

    if (!empleador) {
      return res.status(404).json({ error: 'Empleador empresa no encontrado' });
    }

    res.json(empleador);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el empleador', detalle: error.message });
  }
});

// Crear un nuevo empleador empresa
router.post('/api/empleadores-empresa', async (req, res) => {
  try {
    const nuevoEmpleador = new EmpleadorEmpresa(req.body);
    const empleadorGuardado = await nuevoEmpleador.save();
    res.status(201).json(empleadorGuardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empleador empresa', detalle: error.message });
  }
});

// Actualizar un empleador empresa
router.put('/api/empleadores-empresa/:id', async (req, res) => {
  try {
    const empleadorActualizado = await EmpleadorEmpresa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!empleadorActualizado) {
      return res.status(404).json({ error: 'Empleador empresa no encontrado' });
    }

    res.json(empleadorActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empleador', detalle: error.message });
  }
});

// Eliminar un empleador empresa
router.delete('/api/empleadores-empresa/:id', async (req, res) => {
  try {
    const empleador = await EmpleadorEmpresa.findById(req.params.id);

    if (!empleador) {
      return res.status(404).json({ error: 'Empleador empresa no encontrado' });
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
        await Candidato.findByIdAndUpdate(
          aplicacion.candidatoId,
          { $pull: { aplicaciones: aplicacion._id } }
        );
      }

      // Eliminar aplicaciones
      await Aplicacion.deleteMany({ ofertaId });
    }

    // Eliminar ofertas
    await Oferta.deleteMany({ _id: { $in: ofertaIds } });

    // Finalmente eliminar el empleador
    await EmpleadorEmpresa.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Empleador empresa y sus datos relacionados eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleador empresa', detalle: error.message });
  }
});

// ------------------- Rutas para EmpleadorParticular -------------------

// Obtener todos los empleadores particulares
router.get('/api/empleadores-particular', async (req, res) => {
  try {
    const empleadores = await EmpleadorParticular.find();
    res.json(empleadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleadores', detalle: error.message });
  }
});

// Obtener un empleador particular por ID
router.get('/api/empleadores-particular/:id', async (req, res) => {
  try {
    const empleador = await EmpleadorParticular.findById(req.params.id)
      .populate('ofertas')
      .populate('valoraciones');

    if (!empleador) {
      return res.status(404).json({ error: 'Empleador particular no encontrado' });
    }

    res.json(empleador);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el empleador', detalle: error.message });
  }
});

// Crear un nuevo empleador particular
router.post('/api/empleadores-particular', async (req, res) => {
  try {
    const nuevoEmpleador = new EmpleadorParticular(req.body);
    const empleadorGuardado = await nuevoEmpleador.save();
    res.status(201).json(empleadorGuardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empleador particular', detalle: error.message });
  }
});

// Actualizar un empleador particular
router.put('/api/empleadores-particular/:id', async (req, res) => {
  try {
    const empleadorActualizado = await EmpleadorParticular.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!empleadorActualizado) {
      return res.status(404).json({ error: 'Empleador particular no encontrado' });
    }

    res.json(empleadorActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empleador', detalle: error.message });
  }
});

// Eliminar un empleador particular
router.delete('/api/empleadores-particular/:id', async (req, res) => {
  try {
    const empleador = await EmpleadorParticular.findById(req.params.id);

    if (!empleador) {
      return res.status(404).json({ error: 'Empleador particular no encontrado' });
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
        await Candidato.findByIdAndUpdate(
          aplicacion.candidatoId,
          { $pull: { aplicaciones: aplicacion._id } }
        );
      }

      // Eliminar aplicaciones
      await Aplicacion.deleteMany({ ofertaId });
    }

    // Eliminar ofertas
    await Oferta.deleteMany({ _id: { $in: ofertaIds } });

    // Finalmente eliminar el empleador
    await EmpleadorParticular.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Empleador particular y sus datos relacionados eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleador particular', detalle: error.message });
  }
});

// ------------------- Rutas para Ofertas -------------------

// Obtener todas las ofertas
router.get('/api/ofertas', async (req, res) => {
  try {
    const ofertas = await Oferta.find()
      .populate('aplicaciones');

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas', detalle: error.message });
  }
});

// Obtener ofertas filtradas por estado
router.get('/api/ofertas/estado/:estado', async (req, res) => {
  try {
    const ofertas = await Oferta.find({ estado: req.params.estado })
      .populate('aplicaciones');

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas', detalle: error.message });
  }
});

// Obtener ofertas por ubicación
router.get('/api/ofertas/ubicacion/:ubicacion', async (req, res) => {
  try {
    // Usamos regex para una búsqueda parcial, case-insensitive
    const ofertas = await Oferta.find({
      ubicacion: { $regex: req.params.ubicacion, $options: 'i' }
    });

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas', detalle: error.message });
  }
});

// Obtener una oferta por ID
router.get('/api/ofertas/:id', async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id)
      .populate({
        path: 'aplicaciones',
        populate: { path: 'candidatoId' }
      });

    if (!oferta) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    res.json(oferta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la oferta', detalle: error.message });
  }
});

// Obtener ofertas por empleador
router.get('/api/ofertas/empleador/:empleadorId', async (req, res) => {
  try {
    const ofertas = await Oferta.find({ empleadorId: req.params.empleadorId });

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ofertas', detalle: error.message });
  }
});

// Crear una nueva oferta
router.post('/api/ofertas', async (req, res) => {
  try {
    const nuevaOferta = new Oferta({
      ...req.body,
      estado: req.body.estado || "Abierta"
    });

    const ofertaGuardada = await nuevaOferta.save();

    // Actualizar el empleador (puede ser empresa o particular)
    const esEmpresa = await EmpleadorEmpresa.findById(ofertaGuardada.empleadorId);

    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(
        ofertaGuardada.empleadorId,
        { $push: { ofertas: ofertaGuardada._id } }
      );
    } else {
      await EmpleadorParticular.findByIdAndUpdate(
        ofertaGuardada.empleadorId,
        { $push: { ofertas: ofertaGuardada._id } }
      );
    }

    res.status(201).json(ofertaGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear oferta', detalle: error.message });
  }
});

// Actualizar una oferta
router.put('/api/ofertas/:id', async (req, res) => {
  try {
    const ofertaActualizada = await Oferta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!ofertaActualizada) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    res.json(ofertaActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar oferta', detalle: error.message });
  }
});

// Eliminar una oferta
router.delete('/api/ofertas/:id', async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id);

    if (!oferta) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    // Eliminar todas las aplicaciones relacionadas con esta oferta
    const aplicaciones = await Aplicacion.find({ ofertaId: req.params.id });

    // Actualizar candidatos para quitar referencias a las aplicaciones
    for (const aplicacion of aplicaciones) {
      await Candidato.findByIdAndUpdate(
        aplicacion.candidatoId,
        { $pull: { aplicaciones: aplicacion._id } }
      );
    }

    // Eliminar aplicaciones
    await Aplicacion.deleteMany({ ofertaId: req.params.id });

    // Actualizar el empleador para quitar la referencia a esta oferta
    const esEmpresa = await EmpleadorEmpresa.findOne({ ofertas: req.params.id });

    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(
        oferta.empleadorId,
        { $pull: { ofertas: req.params.id } }
      );
    } else {
      await EmpleadorParticular.findByIdAndUpdate(
        oferta.empleadorId,
        { $pull: { ofertas: req.params.id } }
      );
    }

    // Eliminar la oferta
    await Oferta.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Oferta y sus aplicaciones eliminadas correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar oferta', detalle: error.message });
  }
});

// ------------------- Rutas para ValoracionCandidato -------------------

// Obtener todas las valoraciones de candidatos
router.get('/api/valoraciones-candidato', async (req, res) => {
  try {
    const valoraciones = await ValoracionCandidato.find()
      .populate('candidatoId')
      .populate('empleadorId');

    res.json(valoraciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener valoraciones', detalle: error.message });
  }
});

// Obtener una valoración por ID
router.get('/api/valoraciones-candidato/:id', async (req, res) => {
  try {
    const valoracion = await ValoracionCandidato.findById(req.params.id)
      .populate('candidatoId')
      .populate('empleadorId');

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    res.json(valoracion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la valoración', detalle: error.message });
  }
});

// Obtener valoraciones por candidato
router.get('/api/valoraciones-candidato/candidato/:candidatoId', async (req, res) => {
  try {
    const valoraciones = await ValoracionCandidato.find({ candidatoId: req.params.candidatoId })
      .populate('empleadorId');

    res.json(valoraciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener valoraciones', detalle: error.message });
  }
});

// Crear una nueva valoración de candidato
router.post('/api/valoraciones-candidato', async (req, res) => {
  try {
    const nuevaValoracion = new ValoracionCandidato({
      ...req.body,
      fecha: req.body.fecha || new Date()
    });

    const valoracionGuardada = await nuevaValoracion.save();

    // Actualizar el candidato con esta valoración
    await Candidato.findByIdAndUpdate(
      valoracionGuardada.candidatoId,
      { $push: { valoraciones: valoracionGuardada._id } }
    );

    res.status(201).json(valoracionGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear valoración', detalle: error.message });
  }
});

// Actualizar una valoración de candidato
router.put('/api/valoraciones-candidato/:id', async (req, res) => {
  try {
    const valoracionActualizada = await ValoracionCandidato.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!valoracionActualizada) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    res.json(valoracionActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar valoración', detalle: error.message });
  }
});

// Eliminar una valoración de candidato
router.delete('/api/valoraciones-candidato/:id', async (req, res) => {
  try {
    const valoracion = await ValoracionCandidato.findById(req.params.id);

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    // Actualizar el candidato para quitar la referencia a esta valoración
    await Candidato.findByIdAndUpdate(
      valoracion.candidatoId,
      { $pull: { valoraciones: req.params.id } }
    );

    // Eliminar la valoración
    await ValoracionCandidato.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Valoración eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar valoración', detalle: error.message });
  }
});

// ------------------- Rutas para ValoracionEmpleador -------------------

// Obtener todas las valoraciones de empleadores
router.get('/api/valoraciones-empleador', async (req, res) => {
  try {
    const valoraciones = await ValoracionEmpleador.find()
      .populate('candidatoId')
      .populate('empleadorId');

    res.json(valoraciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener valoraciones', detalle: error.message });
  }
});

// Obtener una valoración por ID
router.get('/api/valoraciones-empleador/:id', async (req, res) => {
  try {
    const valoracion = await ValoracionEmpleador.findById(req.params.id)
      .populate('candidatoId')
      .populate('empleadorId');

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    res.json(valoracion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la valoración', detalle: error.message });
  }
});

// Obtener valoraciones por empleador
router.get('/api/valoraciones-empleador/empleador/:empleadorId', async (req, res) => {
  try {
    const valoraciones = await ValoracionEmpleador.find({ empleadorId: req.params.empleadorId })
      .populate('candidatoId');

    res.json(valoraciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener valoraciones', detalle: error.message });
  }
});

// Crear una nueva valoración de empleador
router.post('/api/valoraciones-empleador', async (req, res) => {
  try {
    const nuevaValoracion = new ValoracionEmpleador({
      ...req.body,
      fecha: req.body.fecha || new Date()
    });

    const valoracionGuardada = await nuevaValoracion.save();

    // Actualizar el empleador con esta valoración
    const esEmpresa = await EmpleadorEmpresa.findById(valoracionGuardada.empleadorId);

    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(
        valoracionGuardada.empleadorId,
        { $push: { valoraciones: valoracionGuardada._id } }
      );
    } else {
      await EmpleadorParticular.findByIdAndUpdate(
        valoracionGuardada.empleadorId,
        { $push: { valoraciones: valoracionGuardada._id } }
      );
    }

    res.status(201).json(valoracionGuardada);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear valoración', detalle: error.message });
  }
});

// Actualizar una valoración de empleador
router.put('/api/valoraciones-empleador/:id', async (req, res) => {
  try {
    const valoracionActualizada = await ValoracionEmpleador.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!valoracionActualizada) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    res.json(valoracionActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar valoración', detalle: error.message });
  }
});

// Eliminar una valoración de empleador
router.delete('/api/valoraciones-empleador/:id', async (req, res) => {
  try {
    const valoracion = await ValoracionEmpleador.findById(req.params.id);

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    // Actualizar el empleador para quitar la referencia a esta valoración
    const esEmpresa = await EmpleadorEmpresa.findOne({ valoraciones: req.params.id });

    if (esEmpresa) {
      await EmpleadorEmpresa.findByIdAndUpdate(
        valoracion.empleadorId,
        { $pull: { valoraciones: req.params.id } }
      );
    } else {
      await EmpleadorParticular.findByIdAndUpdate(
        valoracion.empleadorId,
        { $pull: { valoraciones: req.params.id } }
      );
    }

    // Eliminar la valoración
    await ValoracionEmpleador.findByIdAndDelete(req.params.id);

    res.json({ mensaje: 'Valoración eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar valoración', detalle: error.message });
  }
});

//------------------- Rutas de búsqueda avanzada -------------------

// Búsqueda avanzada de ofertas
router.get('/api/busqueda/ofertas', async (req, res) => {
  try {
    const {
      titulo,
      ubicacion,
      salarioMin,
      salarioMax,
      tipoContrato,
      jornada,
      categoria,
      experienciaMinima,
      estado
    } = req.query;

    let filtro = {};

    // Aplicar filtros si están presentes
    if (titulo) {
      filtro.titulo = { $regex: titulo, $options: 'i' };
    }

    if (ubicacion) {
      filtro.ubicacion = { $regex: ubicacion, $options: 'i' };
    }

    if (salarioMin) {
      filtro.salario = { ...filtro.salario, $gte: Number(salarioMin) };
    }

    if (salarioMax) {
      filtro.salario = { ...filtro.salario, $lte: Number(salarioMax) };
    }

    if (tipoContrato) {
      filtro.tipoContrato = tipoContrato;
    }

    if (jornada) {
      filtro.jornada = jornada;
    }

    if (categoria) {
      filtro.categoria = { $regex: categoria, $options: 'i' };
    }

    if (experienciaMinima) {
      filtro.experienciaMinima = { $gte: Number(experienciaMinima) };
    }

    if (estado) {
      filtro.estado = estado;
    }

    const ofertas = await Oferta.find(filtro)
      .populate('empleadorId');

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda de ofertas', detalle: error.message });
  }
});

// Búsqueda avanzada de candidatos
router.get('/api/busqueda/candidatos', async (req, res) => {
  try {
    const {
      habilidades,
      experiencia,
      educacion,
      ubicacion,
      disponibilidad
    } = req.query;

    let filtro = {};

    if (habilidades) {
      filtro.habilidades = { $regex: habilidades, $options: 'i' };
    }

    if (experiencia) {
      filtro.experiencia = { $gte: Number(experiencia) };
    }

    if (educacion) {
      filtro.educacion = { $regex: educacion, $options: 'i' };
    }

    if (ubicacion) {
      filtro.ubicacion = { $regex: ubicacion, $options: 'i' };
    }

    if (disponibilidad) {
      filtro.disponibilidad = disponibilidad;
    }

    const candidatos = await Candidato.find(filtro);

    res.json(candidatos);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda de candidatos', detalle: error.message });
  }
});

// Búsqueda avanzada de empleadores
router.get('/api/busqueda/empleadores', async (req, res) => {
  try {
    const {
      nombre,
      sector,
      ubicacion,
      tipo
    } = req.query;

    // Buscar en ambos tipos de empleadores
    const buscarEmpresas = async () => {
      let filtroEmpresa = {};
      
      if (nombre) {
        filtroEmpresa.nombre = { $regex: nombre, $options: 'i' };
      }
      
      if (sector) {
        filtroEmpresa.sector = { $regex: sector, $options: 'i' };
      }
      
      if (ubicacion) {
        filtroEmpresa.ubicacion = { $regex: ubicacion, $options: 'i' };
      }
      
      return await EmpleadorEmpresa.find(filtroEmpresa);
    };

    const buscarParticulares = async () => {
      let filtroParticular = {};
      
      if (nombre) {
        filtroParticular.nombre = { $regex: nombre, $options: 'i' };
      }
      
      if (ubicacion) {
        filtroParticular.ubicacion = { $regex: ubicacion, $options: 'i' };
      }
      
      return await EmpleadorParticular.find(filtroParticular);
    };

    // Decidir qué tipo de empleadores buscar
    let resultados = [];
    
    if (!tipo || tipo === 'todos') {
      // Buscar ambos tipos
      const [empresas, particulares] = await Promise.all([
        buscarEmpresas(),
        buscarParticulares()
      ]);
      
      resultados = [
        ...empresas.map(e => ({ ...e.toObject(), tipoEmpleador: 'empresa' })),
        ...particulares.map(p => ({ ...p.toObject(), tipoEmpleador: 'particular' }))
      ];
    } else if (tipo === 'empresa') {
      const empresas = await buscarEmpresas();
      resultados = empresas.map(e => ({ ...e.toObject(), tipoEmpleador: 'empresa' }));
    } else if (tipo === 'particular') {
      const particulares = await buscarParticulares();
      resultados = particulares.map(p => ({ ...p.toObject(), tipoEmpleador: 'particular' }));
    }

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda de empleadores', detalle: error.message });
  }
});

// Buscar aplicaciones por múltiples criterios
router.get('/api/busqueda/aplicaciones', async (req, res) => {
  try {
    const {
      candidatoId,
      ofertaId,
      estado,
      fechaDesde,
      fechaHasta,
      seleccionado
    } = req.query;

    let filtro = {};

    if (candidatoId) {
      filtro.candidatoId = candidatoId;
    }

    if (ofertaId) {
      filtro.ofertaId = ofertaId;
    }

    if (estado) {
      filtro.estado = estado;
    }

    if (fechaDesde || fechaHasta) {
      filtro.fecha = {};
      
      if (fechaDesde) {
        filtro.fecha.$gte = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        filtro.fecha.$lte = new Date(fechaHasta);
      }
    }

    if (seleccionado !== undefined) {
      filtro.seleccionado = seleccionado === 'true';
    }

    const aplicaciones = await Aplicacion.find(filtro)
      .populate('candidatoId')
      .populate('ofertaId');

    res.json(aplicaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda de aplicaciones', detalle: error.message });
  }
});

// Búsqueda de valoraciones
router.get('/api/busqueda/valoraciones', async (req, res) => {
  try {
    const {
      tipo,
      puntuacionMin,
      puntuacionMax,
      fechaDesde,
      fechaHasta,
      empleadorId,
      candidatoId
    } = req.query;

    // Determinar modelo según tipo
    let Modelo;
    if (tipo === 'candidato') {
      Modelo = ValoracionCandidato;
    } else if (tipo === 'empleador') {
      Modelo = ValoracionEmpleador;
    } else {
      return res.status(400).json({ error: 'Debe especificar un tipo válido (candidato o empleador)' });
    }

    let filtro = {};

    if (puntuacionMin || puntuacionMax) {
      filtro.puntuacion = {};
      
      if (puntuacionMin) {
        filtro.puntuacion.$gte = Number(puntuacionMin);
      }
      
      if (puntuacionMax) {
        filtro.puntuacion.$lte = Number(puntuacionMax);
      }
    }

    if (fechaDesde || fechaHasta) {
      filtro.fecha = {};
      
      if (fechaDesde) {
        filtro.fecha.$gte = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        filtro.fecha.$lte = new Date(fechaHasta);
      }
    }

    if (empleadorId) {
      filtro.empleadorId = empleadorId;
    }

    if (candidatoId) {
      filtro.candidatoId = candidatoId;
    }

    const valoraciones = await Modelo.find(filtro)
      .populate('candidatoId')
      .populate('empleadorId');

    res.json(valoraciones);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda de valoraciones', detalle: error.message });
  }
});

// Estadísticas de ofertas
router.get('/api/estadisticas/ofertas', async (req, res) => {
  try {
    const { empleadorId } = req.query;
    
    let filtro = {};
    if (empleadorId) {
      filtro.empleadorId = empleadorId;
    }

    // Total ofertas
    const totalOfertas = await Oferta.countDocuments(filtro);
    
    // Ofertas por estado
    const ofertasPorEstado = await Oferta.aggregate([
      { $match: filtro },
      { $group: { _id: "$estado", total: { $sum: 1 } } }
    ]);
    
    // Ofertas por categoría
    const ofertasPorCategoria = await Oferta.aggregate([
      { $match: filtro },
      { $group: { _id: "$categoria", total: { $sum: 1 } } }
    ]);
    
    // Salario promedio
    const salarioPromedio = await Oferta.aggregate([
      { $match: filtro },
      { $group: { _id: null, promedio: { $avg: "$salario" } } }
    ]);

    res.json({
      totalOfertas,
      ofertasPorEstado,
      ofertasPorCategoria,
      salarioPromedio: salarioPromedio.length > 0 ? salarioPromedio[0].promedio : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas de ofertas', detalle: error.message });
  }
});

// Estadísticas de candidatos
router.get('/api/estadisticas/candidatos', async (req, res) => {
  try {
    // Total candidatos
    const totalCandidatos = await Candidato.countDocuments();
    
    // Candidatos por ubicación
    const candidatosPorUbicacion = await Candidato.aggregate([
      { $group: { _id: "$ubicacion", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);
    
    // Candidatos por nivel de experiencia
    const candidatosPorExperiencia = await Candidato.aggregate([
      { $group: { _id: "$experiencia", total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Promedio de valoraciones de candidatos
    const promedioValoraciones = await ValoracionCandidato.aggregate([
      { $group: { _id: "$candidatoId", promedio: { $avg: "$puntuacion" } } },
      { $group: { _id: null, promedioGeneral: { $avg: "$promedio" } } }
    ]);

    res.json({
      totalCandidatos,
      candidatosPorUbicacion,
      candidatosPorExperiencia,
      promedioValoraciones: promedioValoraciones.length > 0 ? promedioValoraciones[0].promedioGeneral : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas de candidatos', detalle: error.message });
  }
});

// Obtener ranking de ofertas más aplicadas
router.get('/api/ranking/ofertas', async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    const ofertasRanking = await Oferta.aggregate([
      { $lookup: {
          from: "aplicaciones",
          localField: "_id",
          foreignField: "ofertaId",
          as: "aplicaciones"
        }
      },
      { $project: {
          titulo: 1,
          empresa: 1,
          ubicacion: 1,
          categoria: 1,
          totalAplicaciones: { $size: "$aplicaciones" }
        }
      },
      { $sort: { totalAplicaciones: -1 } },
      { $limit: Number(limite) }
    ]);

    res.json(ofertasRanking);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking de ofertas', detalle: error.message });
  }
});

// Obtener ranking de empleadores mejor valorados
router.get('/api/ranking/empleadores', async (req, res) => {
  try {
    const { limite = 10 } = req.query;

    // Obtener valoraciones promedio para empresas
    const valoracionesEmpresas = await ValoracionEmpleador.aggregate([
      { $lookup: {
          from: "empleadorempresas",
          localField: "empleadorId",
          foreignField: "_id",
          as: "empresa"
        }
      },
      { $match: { "empresa": { $ne: [] } } },
      { $group: {
          _id: "$empleadorId",
          nombre: { $first: { $arrayElemAt: ["$empresa.nombre", 0] } },
          sector: { $first: { $arrayElemAt: ["$empresa.sector", 0] } },
          promedio: { $avg: "$puntuacion" },
          totalValoraciones: { $sum: 1 }
        }
      },
      { $match: { totalValoraciones: { $gte: 3 } } }, // Mínimo 3 valoraciones para considerar
      { $sort: { promedio: -1 } },
      { $limit: Number(limite) }
    ]);

    // Obtener valoraciones promedio para particulares
    const valoracionesParticulares = await ValoracionEmpleador.aggregate([
      { $lookup: {
          from: "empleadorparticulars",
          localField: "empleadorId",
          foreignField: "_id",
          as: "particular"
        }
      },
      { $match: { "particular": { $ne: [] } } },
      { $group: {
          _id: "$empleadorId",
          nombre: { $first: { $arrayElemAt: ["$particular.nombre", 0] } },
          tipo: { $literal: "Particular" },
          promedio: { $avg: "$puntuacion" },
          totalValoraciones: { $sum: 1 }
        }
      },
      { $match: { totalValoraciones: { $gte: 3 } } }, // Mínimo 3 valoraciones para considerar
      { $sort: { promedio: -1 } },
      { $limit: Number(limite) }
    ]);

    // Combinar resultados y ordenar
    const resultadosCombinados = [
      ...valoracionesEmpresas.map(e => ({ ...e, tipo: "Empresa" })),
      ...valoracionesParticulares
    ].sort((a, b) => b.promedio - a.promedio)
     .slice(0, Number(limite));

    res.json(resultadosCombinados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking de empleadores', detalle: error.message });
  }
});

// Buscador combinado
router.get('/api/busqueda/combinada', async (req, res) => {
  try {
    const { termino, tipo = 'todos' } = req.query;
    
    if (!termino) {
      return res.status(400).json({ error: 'Debe proporcionar un término de búsqueda' });
    }

    const resultados = {};
    const regex = { $regex: termino, $options: 'i' };

    // Buscar ofertas
    if (tipo === 'todos' || tipo === 'ofertas') {
      resultados.ofertas = await Oferta.find({
        $or: [
          { titulo: regex },
          { descripcion: regex },
          { categoria: regex },
          { ubicacion: regex }
        ]
      }).limit(20);
    }

    // Buscar candidatos
    if (tipo === 'todos' || tipo === 'candidatos') {
      resultados.candidatos = await Candidato.find({
        $or: [
          { nombre: regex },
          { apellidos: regex },
          { habilidades: regex },
          { educacion: regex }
        ]
      }).limit(20);
    }

    // Buscar empleadores (empresas)
    if (tipo === 'todos' || tipo === 'empleadores' || tipo === 'empresas') {
      resultados.empresas = await EmpleadorEmpresa.find({
        $or: [
          { nombre: regex },
          { sector: regex },
          { descripcion: regex }
        ]
      }).limit(20);
    }

    // Buscar empleadores (particulares)
    if (tipo === 'todos' || tipo === 'empleadores' || tipo === 'particulares') {
      resultados.particulares = await EmpleadorParticular.find({
        $or: [
          { nombre: regex },
          { apellidos: regex },
          { descripcion: regex }
        ]
      }).limit(20);
    }

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda combinada', detalle: error.message });
  }
});

module.exports = router;
