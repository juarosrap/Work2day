import { useEffect, useState } from "react";
import "../styles/Profile.css";
import { useAuth } from "../contexts/AuthContext";

export default function Review({ review }) {
  const { currentUser } = useAuth();
  const [empleador, setEmpleador] = useState(null);
  const [empleadorNoEncontrado, setEmpleadorNoEncontrado] = useState(false);
  const [candidato, setCandidato] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API = "http://localhost:5000/api";

    async function getEmpleadorInfo() {
      if (!review?.empleadorId) {
        console.error("ID de empleador no disponible");
        return;
      }

      const empleadorId = review.empleadorId;

      try {
        const responseEmpresa = await fetch(
          `${API}/empleadorEmpresa/${empleadorId}`
        );
        if (responseEmpresa.ok) {
          const dataEmpresa = await responseEmpresa.json();
          setEmpleador(dataEmpresa);
          return;
        }

        const responseParticular = await fetch(
          `${API}/empleadorParticular/${empleadorId}`
        );
        if (responseParticular.ok) {
          const dataParticular = await responseParticular.json();
          setEmpleador(dataParticular);
          return;
        }

        console.error("Empleador no encontrado");
        setEmpleadorNoEncontrado(true);
      } catch (err) {
        console.error("Error al obtener datos del empleador:", err);
        setError("No se pudo cargar la información del empleador");
      }
    }

    async function getCandidatoInfo() {
      if (!review?.candidatoId) {
        console.error("ID de candidato no disponible");
        return;
      }

      const candidatoId = review.candidatoId;

      try {
        const response = await fetch(`${API}/candidato/${candidatoId}`);
        if (response.ok) {
          const data = await response.json();
          setCandidato(data);
        } else {
          console.error(`Error al obtener candidato: ${response.status}`);
        }
      } catch (err) {
        console.error("Error al obtener datos del candidato:", err);
        setError("No se pudo cargar la información del candidato");
      }
    }

    if (currentUser?.userType === "candidato") {
      getEmpleadorInfo();
    } else if (
      currentUser?.userType === "empleadorEmpresa" ||
      currentUser?.userType === "empleadorParticular"
    ) {
      getCandidatoInfo();
    }
  }, [currentUser, review]);

  const renderStars = (puntuacion) => {
    const rating = Math.round(puntuacion / 2);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };


  return (
    <>
      {error && <p className="error">{error}</p>}

      {currentUser?.userType === "candidato" ? (
        <div className="review">
          <img src="ruta-a-imagen-carlos.png" alt="Candidato" />
          <div className="review-content">
            <p className="review-name">
              {empleador?.nombre || "Nombre no disponible"}
            </p>
            <p className="review-role">Empleador</p>
            <div className="stars">{renderStars(review.puntuacion)}</div>
            <p className="review-text">{review.comentario}</p>
          </div>
        </div>
      ) : (
        <div className="review">
          <img src="ruta-a-imagen-carlos.png" alt="Candidato" />
          <div className="review-content">
            <p className="review-name">
              {candidato?.nombre || "Nombre no disponible"}
            </p>
            <p className="review-role">Candidato</p>
            <div className="stars">{renderStars(review.puntuacion)}</div>
            <p className="review-text">{review.comentario}</p>
          </div>
        </div>
      )}
    </>
  );
}
