import { useEffect } from "react";
import "../styles/Modal.css";

export default function CurriculumModal({ isOpen, onClose, candidato }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !candidato) return null;

  const { curriculum } = candidato;
  console.log(candidato.curriculum.experienciaPrevia);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container cv-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Curriculum Vitae de {candidato.nombre}
        </h2>

        <div className="cv-content">
          <div className="cv-section">
            <h3>Información Personal</h3>
            <p>
              <strong>Nombre:</strong> {candidato.nombre}
            </p>
            <p>
              <strong>Correo:</strong> {candidato.correo}
            </p>
            <p>
              <strong>Teléfono:</strong> {candidato.telefono}
            </p>
            <p>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {new Date(candidato.fechaNacimiento).toLocaleDateString("es-ES")}
            </p>
            <p>
              <strong>Descripción:</strong> {curriculum.informacionPersonal}
            </p>
          </div>

          <div className="cv-section">
            <h3>Ubicación</h3>
            <p>{curriculum.ubicacion}</p>
          </div>

          <div className="cv-section">
            <h3>Formación Académica</h3>
            <p>{curriculum.formacionAcademica}</p>
          </div>

          <div className="cv-section">
            <h3>Experiencia Laboral</h3>
            {curriculum.experienciaPrevia &&
              curriculum.experienciaPrevia[0] &&
              curriculum.experienciaPrevia[0].puesto && (
                <p>{curriculum.experienciaPrevia[0].puesto}</p>
              )}
          </div>

          <div className="cv-section">
            <h3>Idiomas</h3>
            <ul>
              {curriculum.idiomas.map((idioma, index) => (
                <li key={index}>{idioma}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
