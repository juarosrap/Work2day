const express = require('express');
const multer = require('multer');
const path = require("path");
const app = express();
const router = express.Router();
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
require("dotenv").config();
const mongoose = require("mongoose");
app.use(express.json());
app.use(router);
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

const Oferta = require("./Ofertas/oferta.model");


const candidatoRoutes = require("./Candidatos/candidato.routes");
const aplicacionRoutes = require("./Aplicaciones/aplicacion.routes");
const empleadorEmpresaRoutes = require("./EmpleadoresEmpresa/empleadorEmpresa.routes");
const empleadorParticularRoutes = require("./EmpleadoresParticular/empleadorParticular.routes");
const ofertaRoutes = require("./Ofertas/ofertas.routes");
const valoracionCandidatoRoutes = require("./ValoracionesCandidato/valoracionCandidato.routes");
const valoracionEmpleadorRoutes = require("./ValoracionesEmpleador/valoracionEmpleador.routes");
const EmpleadorEmpresa = require('./EmpleadoresEmpresa/empleadorEmpresa.model');
const EmpleadorParticular = require('./EmpleadoresParticular/empleadorParticular.model');
const Candidato = require('./Candidatos/candidato.model');
const usuarioRoutes = require('./User/user.routes');



//Rutas
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/candidato", candidatoRoutes);
app.use("/api/aplicaciones", aplicacionRoutes);
app.use("/api/empleadorEmpresa", empleadorEmpresaRoutes);
app.use("/api/empleadorParticular", empleadorParticularRoutes);
app.use("/api/ofertas", ofertaRoutes);
app.use("/api/valoraciones-candidato", valoracionCandidatoRoutes);
app.use("/api/valoraciones-empleador", valoracionEmpleadorRoutes);
app.use("/api",usuarioRoutes);



// Conexión a MongoDB
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000, 
  })
  .then(() => {
    console.log("Conectado a MongoDB");
    
    app.listen(PORT, () => {
      console.log("Servidor escuchando en puerto 5000");
    });
  })
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err);
    process.exit(1); 
  });


// Búsqueda avanzada de ofertas
app.get('/api/busqueda/ofertas', async (req, res) => {
  try {
    const {
      titulo,
      ubicacion,
      salario,
      tipoContrato,
      jornada,
      sector,
      experienciaMinima,
      estado,
    } = req.query;

    let filtro = {};

    console.log(req.query)
    if (titulo) {
      filtro.titulo = { $regex: titulo, $options: 'i' };
    }

    if (ubicacion) {
      filtro.ubicacion = { $regex: ubicacion, $options: 'i' };
    }

    if (salario) {
      filtro.salario = { ...filtro.salario, $gte: Number(salario) };
    }

    if (sector) {
      filtro.sector = { $regex: sector, $options: "i" };
    }

    if (estado) {
      filtro.estado = estado;
    }
     console.log(filtro)
    const ofertas = await Oferta.find(filtro)
      .populate('empleadorId');

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: 'Error en la búsqueda de ofertas', detalle: error.message });
  }
});

app.get('/api/usuarios/:id', async (req,res) => {
  try {
    let usuarioId = req.params.id;
    let usuario = await EmpleadorEmpresa.findById(usuarioId).populate("ofertas")
    .populate("valoraciones");;
    if(!usuario){
      usuario = await EmpleadorParticular.findById(usuarioId).populate("ofertas")
      .populate("valoraciones");;
    }

    if(!usuario){
      usuario = await Candidato.findById(usuarioId).populate("valoraciones");;
    }

    if(!usuario){
      return res.status(404).json({ error: "Usuario no encontrado"});
    }

    res.json(usuario)

  } catch(e) {
    res.status(500).json({ error: 'Error en la búsqueda de usuario', detalle: e.message });
  }
})

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
e;
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
