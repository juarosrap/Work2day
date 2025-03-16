const mongoose = require('mongoose');
const { model,Schema } = mongoose;

const EmpleadorParticularSchema = new Schema({
  nombre: String,
  correo: String,
  telefono: String,
  fotoPerfil: String,
  fechaNacimiento: Date,
  contraseña: String,
  ofertas: [{ type: Schema.Types.ObjectId, ref: "Oferta" }],
  valoraciones: [{ type: Schema.Types.ObjectId, ref: "ValoracionEmpleador" }],
});

EmpleadorParticular = model("EmpleadorParticular", EmpleadorParticularSchema);
module.exports = EmpleadorParticular