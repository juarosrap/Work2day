const mongoose = require('mongoose');
const { model,Schema } = mongoose;

const EmpleadorParticularSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  fotoPerfil: String,
  fechaNacimiento: {
    type: Date,
    required: true,
  },
  descripcion: String,
  contrasena: {
    type: String,
    required: true,
  },
  ofertas: [
    {
      type: Schema.Types.ObjectId,
      ref: "Oferta",
    },
  ],
  valoraciones: [
    {
      type: Schema.Types.ObjectId,
      ref: "ValoracionEmpleador",
    },
  ],
});

EmpleadorParticularSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.contrasena;
  }
});

EmpleadorParticular = model("EmpleadorParticular", EmpleadorParticularSchema);
module.exports = EmpleadorParticular