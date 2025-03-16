require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Candidato = require('./models/candidato.model')
const Aplicacion = require("./models/aplicacion.model");
const EmpleadorEmpresa = require("./models/empleadorEmpresa.model");
const EmpleadorParticular = require("./models/empleadorParticular.model");
const Oferta = require("./models/oferta.model");
const ValoracionEmpleador = require("./models/valoracionEmpleador.model");
const ValoracionCandidato = require("./models/valoracionCandidato.model");

const app = express();
app.use(express.json());
app.use(cors());






app.get("/", async (req, res) => {
    res.send('<h1>Hello World!</h1>')
});


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

