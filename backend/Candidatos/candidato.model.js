const mongoose = require("mongoose");
const { model,Schema } = mongoose;

const CandidatoSchema = new Schema({
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
  contrasena: {
    type: String,
    required: true
  },
  curriculum: {
    informacionPersonal: String,
    ubicacion: String,
    formacionAcademica: String,
    experienciaLaboral: String,
    idiomas: [String],
  },
  aplicaciones: [{ 
    type: Schema.Types.ObjectId, 
    ref: "Aplicacion" 
  }],    
  valoraciones: [{ 
    type: Schema.Types.ObjectId, 
    ref: "ValoracionCandidato" 
  }],
});

CandidatoSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id 
    delete returnedObject.__v
    delete returnedObject.contrasena;
  }
})

const Candidato = model("Candidato", CandidatoSchema);

module.exports = Candidato