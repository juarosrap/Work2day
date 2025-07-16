import "../../styles/forgetModal.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api"; // ✅ Importa apiFetch

export default function Valoracion() {
  const { id, valoradoId, ofertaId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [valoradoData, setValoradoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const isEmpleador =
    currentUser?.userType === "empleadorParticular" ||
    currentUser?.userType === "empleadorEmpresa";

  useEffect(() => {
    const fetchValoradoData = async () => {
      if (!valoradoId) {
        setError("Falta información del usuario a valorar");
        setLoading(false);
        return;
      }

      if (!currentUser) {
        setError("Debes iniciar sesión para valorar");
        setLoading(false);
        return;
      }

      try {
        let data;

        if (isEmpleador) {
          data = await apiFetch(`/api/candidato/${valoradoId}`);
        } else {
          try {
            data = await apiFetch(`/api/empleadorParticular/${valoradoId}`);
          } catch {
            data = await apiFetch(`/api/empleadorEmpresa/${valoradoId}`);
          }
        }

        setValoradoData(data);
      } catch (err) {
        console.error("Error al cargar información del usuario a valorar", err);
        setError("Error al cargar información del usuario a valorar");
      } finally {
        setLoading(false);
      }
    };

    fetchValoradoData();
  }, [valoradoId, currentUser, isEmpleador]);

  const onSubmit = async (data) => {
    try {
      if (!currentUser) {
        setError("Debes iniciar sesión para enviar una valoración");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (!valoradoId) {
        setError("Falta información del usuario a valorar");
        return;
      }

      let API;
      let valoracionData;

      if (isEmpleador) {
        API = `/api/valoraciones-candidato/${valoradoId}`;
        valoracionData = {
          empleadorId: currentUser.id,
          candidatoId: valoradoId,
          puntuacion: parseInt(data.puntuacion),
          comentario: data.comentario,
          fecha: new Date(),
        };
      } else {
        API = `/api/valoraciones-empleador/${valoradoId}`;
        valoracionData = {
          candidatoId: currentUser.id,
          empleadorId: valoradoId,
          puntuacion: parseInt(data.puntuacion),
          comentario: data.comentario,
          fecha: new Date(),
        };
      }

      const response = await apiFetch(API, {
        method: "POST",
        body: valoracionData,
      });

      const setValorada = await apiFetch(`/api/ofertas/${ofertaId}`, {
        method: "PUT",
        body: {
          valorada: true,
          estado: "Expirada",
        },
      });

      if (response && setValorada) {
        setSuccessMessage("Valoración enviada con éxito");
        setTimeout(() => {
          navigate(`/dashboard/${currentUser.id}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error al enviar valoración:", err);
      setError("Error de conexión. Inténtelo de nuevo más tarde.");
    }
  };

  if (loading) {
    return (
      <div className="modal-background">
        <div className="modal-container">
          <p>Cargando información del usuario...</p>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  }

  const nombreValorado = isEmpleador
    ? valoradoData?.nombre || "candidato"
    : valoradoData?.nombreEmpresa || valoradoData?.nombre || "empleador";

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2>Valora a {nombreValorado}</h2>

        {(error || successMessage) && (
          <div className={`status-message ${error ? "error" : "success"}`}>
            {error ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {successMessage}
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
          <div className="form-group-modal">
            <label htmlFor="puntuacion" className="form-label">
              Puntuación (1-10)
            </label>
            <input
              id="puntuacion"
              className="form-input"
              type="number"
              min="1"
              max="10"
              {...register("puntuacion", {
                required: "La puntuación es obligatoria",
                min: { value: 1, message: "La puntuación mínima es 1" },
                max: { value: 10, message: "La puntuación máxima es 10" },
              })}
            />
            {errors.puntuacion && (
              <p className="error-message">{errors.puntuacion.message}</p>
            )}
          </div>

          <div className="form-group-modal">
            <label htmlFor="comentario" className="form-label">
              Comentario
            </label>
            <textarea
              id="comentario"
              className="form-input"
              rows="4"
              {...register("comentario", {
                required: "El comentario es obligatorio",
              })}
            />
            {errors.comentario && (
              <p className="error-message">{errors.comentario.message}</p>
            )}
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="delete-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar valoración"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => window.history.back()}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
