import "../styles/forgetModal.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";

export default function Valoracion() {
  const { id, valoradoId } = useParams();
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
        console.error("No hay ID de valorado para consultar");
        setError("Falta información del usuario a valorar");
        setLoading(false);
        return;
      }

      if (!currentUser) {
        console.error("No hay usuario logueado");
        setError("Debes iniciar sesión para valorar");
        setLoading(false);
        return;
      }

      console.log(
        "Obteniendo datos para:",
        valoradoId,
        "como",
        isEmpleador ? "empleador" : "candidato"
      );

      try {
        let endpoint;

        if (isEmpleador) {
          // Si es empleador valorando a un candidato
          endpoint = `http://localhost:5000/api/candidato/${valoradoId}`;
        } else {
          // Si es candidato valorando a un empleador (particular o empresa)
          // Primero intentamos consultar como empleadorParticular
          const responseParticular = await fetch(
            `http://localhost:5000/api/empleadorParticular/${valoradoId}`
          );

          if (responseParticular.ok) {
            const data = await responseParticular.json();
            console.log("Datos recibidos de empleador particular:", data);
            setValoradoData(data);
            setLoading(false);
            return;
          }

          // Si no es particular, intentamos como empleadorEmpresa
          endpoint = `http://localhost:5000/api/empleadorEmpresa/${valoradoId}`;
        }

        console.log("Consultando endpoint:", endpoint);

        const response = await fetch(endpoint);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error respuesta:", errorText);
          throw new Error(
            `Error al obtener datos del usuario a valorar: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);

        setValoradoData(data);
      } catch (err) {
        console.error("Error completo:", err);
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
        // Empleador valorando a un candidato
        API = `http://localhost:5000/api/valoraciones-candidato`;
        valoracionData = {
          empleadorId: currentUser.id,
          candidatoId: valoradoId,
          puntuacion: parseInt(data.puntuacion),
          comentario: data.comentario,
          fecha: new Date(),
        };
      } else {
        // Candidato valorando a un empleador
        API = `http://localhost:5000/api/valoraciones-empleador`;

        valoracionData = {
          candidatoId: currentUser.id,
          empleadorId: valoradoId,
          puntuacion: parseInt(data.puntuacion),
          comentario: data.comentario,
          fecha: new Date(),
        };
      }

      console.log("Enviando valoración a:", API);
      console.log("Datos:", valoracionData);

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(valoracionData),
      });

      if (response.ok) {
        setSuccessMessage("Valoración enviada con éxito");

        setTimeout(() => {
          navigate(`/dashboard/${currentUser.id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Ha ocurrido un error al enviar la valoración"
        );
      }
    } catch (err) {
      console.error("Error completo al enviar:", err);
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
                min: {
                  value: 1,
                  message: "La puntuación mínima es 1",
                },
                max: {
                  value: 10,
                  message: "La puntuación máxima es 10",
                },
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
