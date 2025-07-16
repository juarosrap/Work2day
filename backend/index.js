require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
app.use("/api/candidato", require("./Candidatos/candidato.routes"));
app.use("/api/aplicaciones", require("./Aplicaciones/aplicacion.routes"));
app.use(
  "/api/empleadorEmpresa",
  require("./EmpleadoresEmpresa/empleadorEmpresa.routes")
);
app.use(
  "/api/empleadorParticular",
  require("./EmpleadoresParticular/empleadorParticular.routes")
);
app.use("/api/ofertas", require("./Ofertas/ofertas.routes"));
app.use(
  "/api/valoraciones-candidato",
  require("./ValoracionesCandidato/valoracionCandidato.routes")
);
app.use(
  "/api/valoraciones-empleador",
  require("./ValoracionesEmpleador/valoracionEmpleador.routes")
);
app.use("/api", require("./User/user.routes"));

// Modelos
const Oferta = require("./Ofertas/oferta.model");
const EmpleadorEmpresa = require("./EmpleadoresEmpresa/empleadorEmpresa.model");
const EmpleadorParticular = require("./EmpleadoresParticular/empleadorParticular.model");
const Candidato = require("./Candidatos/candidato.model");

// Búsqueda de ofertas
app.get("/api/busqueda/ofertas", async (req, res) => {
  try {
    const { titulo, ubicacion, salario, sector, estado } = req.query;
    let filtro = {};

    if (titulo) filtro.titulo = { $regex: titulo, $options: "i" };
    if (ubicacion) filtro.ubicacion = { $regex: ubicacion, $options: "i" };
    if (salario) filtro.salario = { $gte: Number(salario) };
    if (sector) filtro.sector = { $regex: sector, $options: "i" };
    if (estado) filtro.estado = estado;

    const ofertas = await Oferta.find(filtro).populate("empleadorId");
    res.json(ofertas);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error en la búsqueda de ofertas",
        detalle: error.message,
      });
  }
});

// Búsqueda de usuario por ID
app.get("/api/usuarios/:id", async (req, res) => {
  try {
    let usuarioId = req.params.id;
    let usuario = await EmpleadorEmpresa.findById(usuarioId)
      .populate("ofertas")
      .populate("valoraciones");
    if (!usuario) {
      usuario = await EmpleadorParticular.findById(usuarioId)
        .populate("ofertas")
        .populate("valoraciones");
    }
    if (!usuario) {
      usuario = await Candidato.findById(usuarioId).populate("valoraciones");
    }
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (e) {
    res
      .status(500)
      .json({ error: "Error en la búsqueda de usuario", detalle: e.message });
  }
});

// Conexión a MongoDB y lanzamiento del servidor
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Conectado a MongoDB");
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err);
    process.exit(1);
  });
