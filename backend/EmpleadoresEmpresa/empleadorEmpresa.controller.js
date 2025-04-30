const EmpleadorEmpresa = require("./empleadorEmpresa.model");
const Oferta = require("../Ofertas/oferta.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const Candidato = require("../Candidatos/candidato.model");
const ValoracionEmpleador = require("../ValoracionesEmpleador/valoracionEmpleador.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const { contrasena, correo, correoEmpresa, ...otrosDatos } = req.body;

    const correoExistente = await EmpleadorEmpresa.findOne({ correo });
    const correoEmpresaExistente = await EmpleadorEmpresa.findOne({correoEmpresa});

    if (correoExistente || correoEmpresaExistente) {
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

    
    const nuevoEmpleador = new EmpleadorEmpresa({
      ...otrosDatos,
      correo,
      correoEmpresa,
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
        error: "Error al crear empleador empresa",
        detalle: error.message,
      });
  }
};

//Login Empleador empresa
exports.loginEmpleadorEmpresa = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son requeridos" });
    }

    const empleadorExistente = await EmpleadorEmpresa.findOne({ correo });

    if (!empleadorExistente) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const contrasenaValida = await bcrypt.compare(contrasena,empleadorExistente.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = jwt.sign(
      {
        id: empleadorExistente._id,
        correo: empleadorExistente.correo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      {
        id: empleadorExistente._id,
        tokenVersion: empleadorExistente.tokenVersion || 0,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("access_token", accessToken, {
        maxAge: 1000 * 60 * 60,
      })
      .cookie("refresh_token", refreshToken, {
        path: "/api/empleadorEmpresa/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        mensaje: "Login exitoso",
        empleadorEmpresa: {
          id: empleadorExistente._id,
          nombre: empleadorExistente.nombre,
          correo: empleadorExistente.correo,
        },
        accessToken,
      });
  } catch (error) {
    res.status(500).json({
      error: "Error al iniciar sesión",
      detalle: error.message,
    });
  }
};


exports.getCurrentUser = async (req, res) => {
  try {
    console.log("Obteniendo información del empleador con ID:", req.userId);

    const empleador = await EmpleadorEmpresa.findById(req.userId).select("-contrasena");

    if (!empleador) {
      console.log("No se encontró el empleador con ID:", req.userId);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("Empleador encontrado:", empleador);
    return res.json(empleador);
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token no proporcionado" });
    }

    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const empleador = await EmpleadorEmpresa.findById(payload.id);

      if (!empleador) {
        return res.status(403).json({ error: "empleador no encontrado" });
      }

      if (payload.tokenVersion !== empleador.tokenVersion) {
        return res.status(403).json({ error: "Token ya no es válido" });
      }

      
      const newAccessToken = jwt.sign(
        {
          id: empleador._id,
          correo: empleador.correo,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      
      res
        .cookie("access_token", newAccessToken, {
          maxAge: 15 * 60 * 1000,
          path: '/'
        })
        .json({
          mensaje: "Token renovado exitosamente",
          accessToken: newAccessToken,
        });
    } catch (error) {
      return res
        .status(403)
        .json({ error: "Refresh token inválido o expirado" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Error al renovar token",
      detalle: error.message,
    });
  }
};

//Logout de un enmpleador
exports.logoutEmpleadorEmpresa = async (req,res) => {
  try {
    res.clearCookie('access_token')
       .clearCookie('refresh_token')
       .json({message: 'Logout succesful' })
    
  } catch(error) {
    res.status(500).json({
      error: "Error al cerrar sesión",
      detalle: error.message,
    });
  }
}

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
