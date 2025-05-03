const multer = require("multer");

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Archivo demasiado grande",
        detalle: "El tamaño máximo permitido es de 5MB",
      });
    }
    return res.status(400).json({
      error: "Error en la subida de archivo",
      detalle: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      error: "Error en la subida de archivo",
      detalle: err.message,
    });
  }
  next();
};

module.exports = multerErrorHandler;
