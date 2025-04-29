import { useForm } from "react-hook-form";
import "../styles/forgetModal.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ForgetModal() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data) => {
    let API = "http://localhost:5000/api/forgetPassword"
    try {
      const response = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: data.correo }),
      });

      if (response.ok) {
        setSuccessMessage(
          "Se ha enviado un correo con instrucciones para restablecer su contraseña"
        );

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Ha ocurrido un error al enviar el correo"
        );
      }
    } catch (err) {
      setError("Error de conexión. Inténtelo de nuevo más tarde.");
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2>¿Desea restablecer la contraseña?</h2>

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
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Introduzca su correo
            </label>
            <input
              id="correo"
              className="form-input"
              {...register("correo", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Formato de correo inválido",
                },
              })}
              type="email"
              placeholder="ejemplo@correo.com"
            />
            {errors.correo && (
              <p className="error-message">{errors.correo.message}</p>
            )}
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="delete-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar correo"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(`/`)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
