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
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL,
      to: req.body.correo,
      subject: "Restablecer Contraseña",
      html: `<h1>Restablece tu contraseña de Work2Day</h1>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
                <p>El enlace expirará en 10 minutos.</p>
                <p>Si no solicitaste un restablecimiento de contraseña, ignora este correo.
                    PD:Vaya mariquita estas hecho
                </p>`,
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


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; 
    
    const candidato = await Candidato.findById(userId);
    const empleadorEmpresa = await EmpleadorEmpresa.findById(userId);
    const empleadorParticular = await EmpleadorParticular.findById(userId);
    
    let usuario = candidato || empleadorEmpresa || empleadorParticular;
    
    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).send({ message: "Contraseña actual incorrecta" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
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
    res.status(500).send({ message: error.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {

    const decodedToken = jwt.verify(req.params.token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(400).send({ message: "Token inválido" });
    }

    const candidato = await Candidato.findById(decodedToken.userId);
    const empleadorEmpresa = await EmpleadorEmpresa.findById(
      decodedToken.userId
    );
    const empleadorParticular = await EmpleadorParticular.findById(
      decodedToken.userId
    );

    let usuario = candidato || empleadorEmpresa || empleadorParticular;

    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    if (!req.body.newPassword) {
      return res
        .status(400)
        .send({ message: "La nueva contraseña es requerida" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

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
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ message: "Token inválido o expirado" });
    }
    res.status(500).send({ message: error.message });
  }
};
