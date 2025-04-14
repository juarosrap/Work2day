const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    // Verifica que req.cookies exista
    if (!req.cookies) {
      console.log(
        "req.cookies es undefined - cookie-parser no está configurado correctamente"
      );
      return res
        .status(401)
        .json({ error: "No autorizado - Error de configuración de cookies" });
    }

    const token = req.cookies.access_token;

    if (!token) {
      console.log("No hay token de acceso en la petición");
      return res
        .status(401)
        .json({ error: "No autorizado - Token no presente" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};