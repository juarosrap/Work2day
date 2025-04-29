const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Candidato = require("../Candidatos/candidato.model");
const EmpleadorEmpresa = require("../EmpleadoresEmpresa/empleadorEmpresa.model");
const EmpleadorParticular = require("../EmpleadoresParticular/empleadorParticular.model");

exports.forgetPassword = async (req, res) => {
  try {
    if (!req.body.correo) {
      return res.status(400).send({ message: "El correo es requerido" });
    }

    const candidato = await Candidato.findOne({ correo: req.body.correo });
    const empleadorEmpresa = await EmpleadorEmpresa.findOne({
      correo: req.body.correo,
    });
    const empleadorParticular = await EmpleadorParticular.findOne({
      correo: req.body.correo,
    });

    let usuario = candidato || empleadorEmpresa || empleadorParticular;

    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.correo,
      subject: "Restablecer Contraseña",
      html: `<h1>Restablece tu contraseña</h1>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
                <p>El enlace expirará en 10 minutos.</p>
                <p>Si no solicitaste un restablecimiento de contraseña, ignora este correo.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Correo enviado con éxito" });
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Verify token
    const decodedToken = jwt.verify(req.params.token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(400).send({ message: "Token inválido" });
    }

    // Find user by ID across all user types
    const candidato = await Candidato.findById(decodedToken.userId);
    const empleadorEmpresa = await EmpleadorEmpresa.findById(
      decodedToken.userId
    );
    const empleadorParticular = await EmpleadorParticular.findById(
      decodedToken.userId
    );

    // Determine which user was found
    let usuario = candidato || empleadorEmpresa || empleadorParticular;

    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    // Validate new password
    if (!req.body.newPassword) {
      return res
        .status(400)
        .send({ message: "La nueva contraseña es requerida" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    // Update the user's password based on type
    if (candidato) {
      candidato.contrasena = hashedPassword;
      await candidato.save();
    } else if (empleadorParticular) {
      empleadorParticular.contrasena = hashedPassword;
      await empleadorParticular.save();
    } else {
      empleadorEmpresa.contrasena = hashedPassword;
      await empleadorEmpresa.save();
    }

    res.status(200).send({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    // Handle token verification errors specifically
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ message: "Token inválido o expirado" });
    }
    res.status(500).send({ message: error.message });
  }
};
