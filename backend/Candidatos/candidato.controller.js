const Candidato = require("./candidato.model");
const Aplicacion = require("../Aplicaciones/aplicacion.model");
const ValoracionCandidato = require("../ValoracionesCandidato/valoracionCandidato.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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

// Registrar un candidato nuevo
exports.crearCandidato = async (req, res) => {
  try {
    
    const { contrasena, correo, ...otrosDatos } = req.body;

    const candidatoExistente = await Candidato.findOne({ correo });

    if (candidatoExistente) {
      return res
        .status(400)
        .json({ error: "Ya existe un candidato con ese correo electrónico" });
    }
    
    if (!contrasena) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    if (typeof contrasena !== 'string') {
      return res.status(400).json({error: "La contraseña debe ser un string"})
    }
    
    if (contrasena.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const passwordHash = await bcrypt.hash(contrasena, 10);
    
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

// Login de un candidato
exports.loginCandidato = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    const candidatoExistente = await Candidato.findOne({ correo });

    if (!candidatoExistente) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
 
    const contrasenaValida = await bcrypt.compare(contrasena, candidatoExistente.contrasena);
    
    if (!contrasenaValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = jwt.sign(
      { 
        id: candidatoExistente._id,
        correo: candidatoExistente.correo 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
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
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        path: "/api/candidatos/refresh", 
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        mensaje: "Login exitoso",
        candidato: {
          id: candidatoExistente._id,
          nombre: candidatoExistente.nombre,
          correo: candidatoExistente.correo,
        },
        accessToken,
      });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Error al iniciar sesión", 
      detalle: error.message 
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // req.userId debería estar disponible gracias al middleware de autenticación
    const candidatoId = req.userId;

    if (!candidatoId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const candidato = await Candidato.findById(candidatoId).select(
      "-contrasena"
    ); // Excluimos la contraseña

    if (!candidato) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      id: candidato._id,
      nombre: candidato.nombre,
      correo: candidato.correo,
      // Añadir cualquier otra información necesaria
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener información del usuario",
      detalle: error.message,
    });
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
          httpOnly: true,
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
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
exports.logoutCandidato = async (req,res) => {
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

    await Aplicacion.deleteMany({ candidatoId: req.params.id });
    await ValoracionCandidato.deleteMany({ candidatoId: req.params.id });

    res.json({ mensaje: "Candidato eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar candidato", detalle: error.message });
  }
};
