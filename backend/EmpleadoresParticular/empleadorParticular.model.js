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

EmpleadorParticularSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

EmpleadorParticular = model("EmpleadorParticular", EmpleadorParticularSchema);
module.exports = EmpleadorParticular