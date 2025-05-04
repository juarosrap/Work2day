// Candidatos/candidato.controller.js - Código actualizado
const Candidato = require("./candidato.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const ValoracionCandidato = require("../ValoracionesCandidato/valoracionCandidato.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
      .populate({
        path: "valoraciones",
        select: "-__v",
      });
    console.log("valoraciones:", candidato.valoraciones);

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

// Registrar un candidato nuevo
exports.crearCandidato = async (req, res) => {
  try {
    const { contrasena, correo, ...otrosDatos } = req.body;
    
    console.log("Datos recibidos en el controlador:", req.body);

    const candidatoExistente = await Candidato.findOne({ correo });

    if (candidatoExistente) {
      return res
        .status(400)
        .json({ error: "Ya existe un candidato con ese correo electrónico" });
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
      imagenPath = `/uploads/candidatos/${req.file.filename}`;
    }
    
    const curriculum = {};
    
    if (req.body.informacionPersonal) {
      curriculum.informacionPersonal = req.body.informacionPersonal;
    }
    
    if (req.body.ubicacionCurriculum) {
      curriculum.ubicacion = req.body.ubicacionCurriculum;
    }
    
    if (req.body.formacionAcademica) {
      curriculum.formacionAcademica = req.body.formacionAcademica;
    }
    
    if (req.body.idiomas) {
      try {
        curriculum.idiomas = JSON.parse(req.body.idiomas);
      } catch (e) {
        console.error("Error al parsear idiomas:", e);
        curriculum.idiomas = req.body.idiomas.split(",").map(i => i.trim());
      }
    }
    
    if (req.body.experienciaPrevia) {
      try {
        curriculum.experienciaPrevia = JSON.parse(req.body.experienciaPrevia);
      } catch (e) {
        console.error("Error al parsear experienciaPrevia:", e);
      }
    }
    
    if (req.body.curriculumCompleto) {
      try {
        const curriculumParsed = JSON.parse(req.body.curriculumCompleto);
        curriculum.informacionPersonal = curriculum.informacionPersonal || curriculumParsed.informacionPersonal;
        curriculum.ubicacion = curriculum.ubicacion || curriculumParsed.ubicacion;
        curriculum.formacionAcademica = curriculum.formacionAcademica || curriculumParsed.formacionAcademica;
        curriculum.idiomas = curriculum.idiomas || curriculumParsed.idiomas;
        curriculum.experienciaPrevia = curriculum.experienciaPrevia || curriculumParsed.experienciaPrevia;
      } catch (e) {
        console.error("Error al parsear curriculumCompleto:", e);
      }
    }
    
    console.log("Curriculum procesado:", curriculum);

    const nuevoCandidato = new Candidato({
      ...otrosDatos,
      correo,
      contrasena: passwordHash,
      fotoPerfil: imagenPath,
      curriculum: curriculum 
    });

    console.log("Nuevo candidato a guardar:", nuevoCandidato);

    const candidatoGuardado = await nuevoCandidato.save({
      runValidators: true,
    });

    res.status(201).json(candidatoGuardado);
  } catch (error) {
    console.error("Error completo:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ error: "Error al crear candidato", detalle: error.message });
  }
};

// // Subir o actualizar imagen de perfil
// exports.subirImagenPerfil = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ error: "No se ha proporcionado ninguna imagen" });
//     }

//     const candidatoId = req.params.id;
//     const candidato = await Candidato.findById(candidatoId);

//     if (!candidato) {
      
//       fs.unlinkSync(req.file.path);
//       return res.status(404).json({ error: "Candidato no encontrado" });
//     }

//     // Si ya tenía una imagen, eliminar la anterior
//     if (candidato.imagen && candidato.imagen.startsWith("/uploads/")) {
//       const imagenAnterior = path.join(__dirname, "..", candidato.imagen);
//       if (fs.existsSync(imagenAnterior)) {
//         fs.unlinkSync(imagenAnterior);
//       }
//     }

//     // Actualizar con la nueva ruta de imagen
//     const imagenPath = `/uploads/candidatos/${req.file.filename}`;
//     candidato.imagen = imagenPath;
//     await candidato.save();

//     res.json({
//       mensaje: "Imagen de perfil actualizada correctamente",
//       imagen: imagenPath,
//     });
//   } catch (error) {
//     // Si hay error, eliminar la imagen subida
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({
//       error: "Error al subir la imagen de perfil",
//       detalle: error.message,
//     });
//   }
// };

// Login de un candidato
exports.loginCandidato = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son requeridos" });
    }

    const candidatoExistente = await Candidato.findOne({ correo });

    if (!candidatoExistente) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      candidatoExistente.contrasena
    );

    if (!contrasenaValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = jwt.sign(
      {
        id: candidatoExistente._id,
        correo: candidatoExistente.correo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      {
        id: candidatoExistente._id,
        tokenVersion: candidatoExistente.tokenVersion || 0,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("access_token", accessToken, {
        maxAge: 1000 * 60 * 60,
      })
      .cookie("refresh_token", refreshToken, {
        path: "/api/candidato/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        mensaje: "Login exitoso",
        candidato: {
          id: candidatoExistente._id,
          nombre: candidatoExistente.nombre,
          correo: candidatoExistente.correo,
          imagen: candidatoExistente.imagen,
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
    console.log("Obteniendo información del usuario con ID:", req.userId);

    const candidato = await Candidato.findById(req.userId);

    if (!candidato) {
      console.log("No se encontró el candidato con ID:", req.userId);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("Candidato encontrado:", candidato);
    return res.json(candidato);
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

      const candidato = await Candidato.findById(payload.id);

      if (!candidato) {
        return res.status(403).json({ error: "Candidato no encontrado" });
      }

      if (payload.tokenVersion !== candidato.tokenVersion) {
        return res.status(403).json({ error: "Token ya no es válido" });
      }

      const newAccessToken = jwt.sign(
        {
          id: candidato._id,
          correo: candidato.correo,
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

//Logout de un candidato
exports.logoutCandidato = async (req, res) => {
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

// Actualizar un candidato
exports.actualizarCandidato = async (req, res) => {
  try {
    const datosActualizacion = { ...req.body };
    console.log(req.file)
    if (req.file) {
      const candidatoActual = await Candidato.findById(req.params.id);
      if (
        candidatoActual &&
        candidatoActual.fotoPerfil &&
        candidatoActual.fotoPerfil.startsWith("/uploads/")
      ) {
        const rutaAnterior = path.join(
          __dirname,
          "..",
          candidatoActual.fotoPerfil
        );
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }

      datosActualizacion.fotoPerfil = `/uploads/candidatos/${req.file.filename}`;
    }

    const candidatoActualizado = await Candidato.findByIdAndUpdate(
      req.params.id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!candidatoActualizado) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Candidato no encontrado" });
    }

    res.json(candidatoActualizado);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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

    // Eliminar imagen asociada si existe
    if (
      candidatoEliminado.fotoPerfil &&
      candidatoEliminado.imagen.startsWith("/uploads/")
    ) {
      const rutaImagen = path.join(
        __dirname,
        "..",
        candidatoEliminado.fotoPerfil
      );
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }

    await Aplicacion.deleteMany({ candidatoId: req.params.id });
    await ValoracionCandidato.deleteMany({ candidatoId: req.params.id });

    res.json({ mensaje: "Candidato eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar candidato", detalle: error.message });
  }
};
