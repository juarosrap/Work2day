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
      sector,
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
      usuario = await Candidato.findById(usuarioId).populate("valoraciones");
    }

    if(!usuario){
      return res.status(404).json({ error: "Usuario no encontrado"});
    }

    res.json(usuario)

  } catch(e) {
    res.status(500).json({ error: 'Error en la búsqueda de usuario', detalle: e.message });
  }
})

module.exports = router;
