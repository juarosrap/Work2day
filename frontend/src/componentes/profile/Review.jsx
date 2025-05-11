import { useEffect, useState } from "react";
import "../../styles/Profile.css"; 
import { useAuth } from "../../contexts/AuthContext";
import defaultAvatar from "../../assets/default-avatar.jpg"; 


const API_URL = "http://localhost:5000";

export default function Review({ review }) {
  const { currentUser } = useAuth();
  const [empleador, setEmpleador] = useState(null);
  const [candidato, setCandidato] = useState(null);
  const [error, setError] = useState(null);
  const [loadingReviewerDetails, setLoadingReviewerDetails] = useState(true);
  const [imageError, setImageError] = useState(false); 

  useEffect(() => {
    const API = `${API_URL}/api`; 

    setEmpleador(null);
    setCandidato(null);
    setError(null);
    setImageError(false);
    setLoadingReviewerDetails(true);

    async function getEmpleadorInfo() {
      if (!review?.empleadorId) {
        setError("ID de empleador no disponible en la reseña.");
        setLoadingReviewerDetails(false);
        return;
      }

      const empleadorId = review.empleadorId;

      try {
        let response = await fetch(`${API}/empleadorEmpresa/${empleadorId}`);
        if (response.ok) {
          const dataEmpresa = await response.json();
          setEmpleador(dataEmpresa);
          return; 
        }

        response = await fetch(`${API}/empleadorParticular/${empleadorId}`);
        if (response.ok) {
          const dataParticular = await response.json();
          setEmpleador(dataParticular);
          return; 
        }

        // Si no se encontró por ninguna de las dos vías
        console.error(`Empleador con ID ${empleadorId} no encontrado como empresa ni particular.`);
        setError("No se pudo encontrar la información del empleador que hizo la reseña.");
      } catch (err) {
        console.error("Error al obtener datos del empleador:", err);
        setError(
          "No se pudo cargar la información del empleador de la reseña."
        );
      }
    }

    async function getCandidatoInfo() {
      if (!review?.candidatoId) {
        console.error("ID de candidato no disponible en la reseña");
        setError("ID de candidato no disponible en la reseña.");
        setLoadingReviewerDetails(false);
        return;
      }

      const candidatoId = review.candidatoId;

      try {
        const response = await fetch(`${API}/candidato/${candidatoId}`); 
        if (response.ok) {
          const data = await response.json();
          setCandidato(data);
        } else {
          console.error(`Error al obtener candidato con ID ${candidatoId}: ${response.status}`);
          setError("No se pudo encontrar la información del candidato que hizo la reseña.");
        }
      } catch (err) {
        console.error("Error al obtener datos del candidato:", err);
        setError(
          "No se pudo cargar la información del candidato de la reseña."
        );
      }
    }

    async function fetchAuthorDetails() {
      if (currentUser?.userType === "candidato") {
        await getEmpleadorInfo();
      } else if (
        currentUser?.userType === "empleadorEmpresa" ||
        currentUser?.userType === "empleadorParticular"
      ) {
        await getCandidatoInfo();
      }
      setLoadingReviewerDetails(false);
    }

    if (review && currentUser) {
      fetchAuthorDetails();
    } else {
      setLoadingReviewerDetails(false);
      if (!review) setError("Faltan datos de la reseña.");
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

  const authorInfo =
    currentUser?.userType === "candidato" ? empleador : candidato;
  const authorName =
    authorInfo?.nombre || authorInfo?.nombreEmpresa || "Autor no disponible";
  const authorRole =
    currentUser?.userType === "candidato" ? "Empleador" : "Candidato";
  const authorPhotoUrl = authorInfo?.fotoPerfil
    ? `${API_URL}${authorInfo.fotoPerfil}`
    : null;

  if (loadingReviewerDetails) {
    return <div className="review">Cargando reseña...</div>;
  }

  return (
    <>
      {error && !loadingReviewerDetails && (
        <p className="error-review">{error}</p>
      )}

      
      {!loadingReviewerDetails && (authorInfo || !error) && (
        <div className="review">
          <div className="review-author-photo">
            {authorPhotoUrl && !imageError ? (
              <img
                src={authorPhotoUrl}
                alt={`Foto de ${authorName}`}
                onError={() => setImageError(true)}
              />
            ) : (
              <img src={defaultAvatar} alt="Foto por defecto del autor" />
            )}
          </div>
          <div className="review-content">
            <p className="review-name">{authorName}</p>
            <p className="review-role">{authorRole}</p>
            <div className="stars">{renderStars(review.puntuacion)}</div>
            <p className="review-text">{review.comentario}</p>
          </div>
        </div>
      )}
    </>
  );
}
