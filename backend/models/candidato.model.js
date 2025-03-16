const mongoose = require("mongoose");
const { model,Schema } = mongoose;

const CandidatoSchema = new Schema({
  nombre: String,
  correo: String,
  telefono: String,
  fotoPerfil: String,
  fechaNacimiento: Date,
  contraseña: String,
  curriculum: {
    informacionPersonal: String,
    ubicacion: String,
    formacionAcademica: String,
    experienciaLaboral: String,
    idiomas: [String],
  },
  aplicaciones: [{ type: Schema.Types.ObjectId, ref: "Aplicacion" }],
  valoraciones: [{ type: Schema.Types.ObjectId, ref: "ValoracionCandidato" }],
});

const Candidato = model("Candidato", CandidatoSchema);

module.exports = Candidato