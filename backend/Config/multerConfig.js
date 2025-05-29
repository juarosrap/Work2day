const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createDirectories = () => {
  const dirs = [
    "./uploads",
    "./uploads/candidatos",
    "./uploads/empresas",
    "./uploads/particulares",
    "./uploads/ofertas",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir = "./uploads";

    if (req.baseUrl.includes("candidato")) {
      uploadDir = "./uploads/candidatos";
    } else if (req.baseUrl.includes("empleadorEmpresa")) {
      uploadDir = "./uploads/empresas";
    } else if (req.baseUrl.includes("empleadorParticular")) {
      uploadDir = "./uploads/particulares";
    } else if (req.baseUrl.includes("ofertas")) {
      uploadDir = "./uploads/ofertas";
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Solo se permiten archivos de imagen (jpeg, jpg, png, gif)"),
      false
    );
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, 
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
