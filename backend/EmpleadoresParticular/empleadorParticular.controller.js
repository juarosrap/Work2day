const EmpleadorParticular = require("./empleadorParticular.model");
const Oferta = require("../Ofertas/oferta.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const Candidato = require("../Candidatos/candidato.model");
const ValoracionEmpleador = require("../ValoracionesEmpleador/valoracionEmpleador.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

    const correoExistente = await EmpleadorParticular.findOne({ correo });

    if (correoExistente) {
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

    let imagenPath = null;
    if (req.file) {
      imagenPath = `/uploads/particulares/${req.file.filename}`;
    }

    const nuevoEmpleador = new EmpleadorParticular({
      ...otrosDatos,
      correo,
      contrasena: passwordHash,
      fotoPerfil: imagenPath,
    });

    const empleadorGuardado = await nuevoEmpleador.save({
      runValidators: true,
    });

    res.status(201).json(empleadorGuardado);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: "Error al crear empleador particular",
      detalle: error.message,
    });
  }
};

//Login Empleador particular
exports.loginEmpleadorParticular = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son requeridos" });
    }

    const empleadorExistente = await EmpleadorParticular.findOne({ correo });

    if (!empleadorExistente) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      empleadorExistente.contrasena
    );

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
        path: "/api/empleadorParticular/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        mensaje: "Login exitoso",
        empleadorParticular: {
          id: empleadorExistente._id,
          nombre: empleadorExistente.nombre,
          correo: empleadorExistente.correo,
          imagen: empleadorExistente.imagen,
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

    const empleador = await EmpleadorParticular.findById(req.userId).select(
      "-contrasena"
    );

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

      const empleador = await EmpleadorParticular.findById(payload.id);

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
          path: "/",
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

//Logout de un empleador
exports.logoutEmpleadorParticular = async (req, res) => {
  try {
    res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .json({ message: "Logout succesful" });
  } catch (error) {
    res.status(500).json({
      error: "Error al cerrar sesión",
      detalle: error.message,
    });
  }
};

exports.actualizarEmpleadorParticular = async (req, res) => {
  try {
    const datosActualizacion = { ...req.body };

    if (req.file) {
      const empleadorActual = await EmpleadorParticular.findById(req.params.id);
      if (
        empleadorActual &&
        empleadorActual.fotoPerfil &&
        empleadorActual.fotoPerfil.startsWith("/uploads/")
      ) {
        const rutaAnterior = path.join(
          __dirname,
          "..",
          empleadorActual.fotoPerfil
        );
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }

      datosActualizacion.fotoPerfil = `/uploads/particulares/${req.file.filename}`;
    }

    const empleadorActualizado = await EmpleadorParticular.findByIdAndUpdate(
      req.params.id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!empleadorActualizado) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(404)
        .json({ error: "Empleador particular no encontrado" });
    }

    res.json(empleadorActualizado);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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

    // Eliminar imagen asociada si existe
    if (empleador.fotoPerfil && empleador.fotoPerfil.startsWith("/uploads/")) {
      const rutaImagen = path.join(__dirname, "..", empleador.fotoPerfil);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
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
    res.status(500).json({
      error: "Error al eliminar empleador particular",
      detalle: error.message,
    });
  }
};

// Subir o actualizar imagen de perfil
exports.subirImagenPerfil = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se ha proporcionado ninguna imagen" });
    }

    const empleadorId = req.params.id;
    const empleador = await EmpleadorParticular.findById(empleadorId);

    if (!empleador) {
      // Si no se encuentra el empleador, eliminar la imagen subida
      fs.unlinkSync(req.file.path);
      return res
        .status(404)
        .json({ error: "Empleador particular no encontrado" });
    }

    // Si ya tenía una imagen, eliminar la anterior
    if (empleador.fotoPerfil && empleador.fotoPerfil.startsWith("/uploads/")) {
      const imagenAnterior = path.join(__dirname, "..", empleador.fotoPerfil);
      if (fs.existsSync(imagenAnterior)) {
        fs.unlinkSync(imagenAnterior);
      }
    }

    // Actualizar con la nueva ruta de imagen
    const imagenPath = `/uploads/particulares/${req.file.filename}`;
    empleador.fotoPerfil = imagenPath;
    await empleador.save();

    res.json({
      mensaje: "Imagen de perfil actualizada correctamente",
      fotoPerfil: imagenPath,
    });
  } catch (error) {
    // Si hay error, eliminar la imagen subida
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: "Error al subir la imagen de perfil",
      detalle: error.message,
    });
  }
};
