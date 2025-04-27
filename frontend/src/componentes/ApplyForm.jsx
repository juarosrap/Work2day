import { useEffect, useState } from "react";
import "../styles/ModalForm.css";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

export default function ApplyForm() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (currentUser && currentUser.id && currentUser.userType === "candidato") {
      async function getUser() {
        setIsLoading(true);
        const API = `http://localhost:5000/api/candidato/${currentUser.id}`;

        try {
          const response = await fetch(API);

          if (!response.ok) {
            if (response.status === 404) {
              const errorData = await response.json();
              setApiError(errorData.message || "Usuario no encontrado");
            } else {
              setApiError("Error al obtener los datos del usuario");
            }
            setIsLoading(false);
            return;
          }

          const data = await response.json();

          
          setValue("correo", data.correo || "");
          setValue("informacionPersonal", data.curriculum.informacionPersonal || "");
          setValue("ubicacion", data.curriculum.ubicacion || "");
          setValue(
            "formacionAcademica",
            data.curriculum.formacionAcademica || ""
          );
          setValue(
            "experienciaLaboral",
            data.curriculum.experienciaLaboral || ""
          );
          setValue(
            "idiomas",
            Array.isArray(data.curriculum.idiomas)
              ? data.curriculum.idiomas.join(", ")
              : ""
          );

          setIsLoading(false);
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          setApiError("Error de conexión al obtener los datos del usuario");
          setIsLoading(false);
        }
      }

      getUser();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, setValue]);

  const onSubmit = async (data) => {
    try {
      const API = `http://localhost:5000/api/aplicaciones`;
      const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fecha: "", 
        seleccionado: false,
        fechaSeleccion: "",
        fechaFinalizacion: "",
        candidatoId: currentUser.id,
        ofertaId: id,
      }),
    });

      if(!response.ok) {
        setApiError(response.json());
        console.error(response.json());
      }

      // const data = response.json()
      // console.log("CV enviado:", data);

      
      setSuccessMessage("Aplicación enviada con éxito");
      setTimeout(() => {
        navigate("/jobs")
      }, 2000);
    } catch (error) {
      setApiError("Error al enviar la aplicación");
    }
  };

  if (isLoading) {
    return (
      <div className="modal-background">
        <div className="modal-container">
          <h2 style={{ textAlign: "center" }}>Cargando...</h2>
        </div>
      </div>
    );
  }

  
  if (!currentUser || currentUser.userType !== "candidato") {
    return (
      <div className="modal-background">
        <div className="modal-container">
          <h2 style={{ textAlign: "center" }}>No puedes aplicar</h2>
          <p style={{ textAlign: "center", margin: "20px 0" }}>
            Para poder aplicar a una oferta debes ser un candidato registrado.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => navigate("/jobs")} style={{ padding: "8px 16px" }}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2 style={{ textAlign: "center" }}>Aplicar a Oferta</h2>

        {apiError && (
          <div
            className="error-message"
            style={{ color: "red", textAlign: "center", margin: "10px 0" }}
          >
            {apiError}
          </div>
        )}

        {successMessage && (
          <div
            className="success-message"
            style={{ color: "green", textAlign: "center", margin: "10px 0" }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
          <label>Correo</label>
          <input
            {...register("correo", {
              required: "El correo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido",
              },
            })}
          />
          {errors.correo && (
            <span className="error-text">{errors.correo.message}</span>
          )}

          <h3 style={{ textAlign: "center" }}>Currículum</h3>

          <label>Información Personal</label>
          <input
            {...register("informacionPersonal", {
              required: "La información personal es obligatoria",
            })}
          />
          {errors.informacionPersonal && (
            <span className="error-text">
              {errors.informacionPersonal.message}
            </span>
          )}

          <label>Ubicación</label>
          <input
            {...register("ubicacion", {
              required: "La ubicación es obligatoria",
            })}
          />
          {errors.ubicacion && (
            <span className="error-text">{errors.ubicacion.message}</span>
          )}

          <label>Formación Académica</label>
          <input
            {...register("formacionAcademica", {
              required: "La formación académica es obligatoria",
            })}
          />
          {errors.formacionAcademica && (
            <span className="error-text">
              {errors.formacionAcademica.message}
            </span>
          )}

          <label>Experiencia Laboral</label>
          <input
            {...register("experienciaLaboral", {
              required: "La experiencia laboral es obligatoria",
            })}
          />
          {errors.experienciaLaboral && (
            <span className="error-text">
              {errors.experienciaLaboral.message}
            </span>
          )}

          <label>Idiomas (separados por coma)</label>
          <input {...register("idiomas")} />

          <div
            className="form-buttons"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              style={{ backgroundColor: "#ccc" }}
            >
              Cancelar
            </button>
            <button type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
