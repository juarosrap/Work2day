import React from "react";

export default function ExperienciaDestacada({ experienciaPrevia }) {
  if (!experienciaPrevia || experienciaPrevia.length === 0) {
    return (
      <div className="exp-profile box">
        <h3>Experiencia Destacada</h3>
        <p>No hay experiencia laboral registrada.</p>
      </div>
    );
  }

  const formatearFecha = (fechaString, esFechaFin) => {
    if (!fechaString && esFechaFin) return "Actualidad";
    if (!fechaString) return "";

    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return "";

    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
  };

  const experienciasValidas = experienciaPrevia.filter(
    (exp) => exp && (exp.empresa || exp.puesto)
  );

  if (experienciasValidas.length === 0) {
    return (
      <div className="exp-profile box">
        <h3>Experiencia Destacada</h3>
        <p>No hay experiencia laboral registrada.</p>
      </div>
    );
  }

  return (
    <div className="exp-profile box">
      <h3>Experiencia Destacada</h3>
      {experienciasValidas.map((exp, index) => (
        <div key={index} className="past-job">
          {/* Imagen condicional si existe */}
          {exp.imagenEmpresa && (
            <img src={exp.imagenEmpresa} alt={`Logo de ${exp.empresa}`} />
          )}
          <div className="job-info">
            <p className="job-title">
              {exp.puesto ? exp.puesto : ""}
              {exp.puesto && exp.empresa ? " - " : ""}
              {exp.empresa ? exp.empresa : ""}
            </p>
            {(exp.fechaInicio || exp.fechaFin) && (
              <p className="job-dates">
                {formatearFecha(exp.fechaInicio, false)}
                {exp.fechaInicio || exp.fechaFin ? " - " : ""}
                {formatearFecha(exp.fechaFin, true)}
              </p>
            )}
            {exp.descripcion && (
              <p className="job-description">{exp.descripcion}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
