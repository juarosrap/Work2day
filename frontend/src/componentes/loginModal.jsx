import { useState } from "react";
import "../styles/ModalForm.css"; 
import "../styles/Modal.css"; 
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function LoginModal() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  let API = "http://localhost:5000/api/";

  const [tipo, setTipo] = useState("candidato");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  

  const navigate = useNavigate();

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
    marginBottom: "8px",
  };

  const onSubmit = async  (data) => {
    if (data.tipo === "candidato") {
      API = "http://localhost:5000/api/candidatos/login";
    } else if (data.tipo === "empleadorParticular") {
      API = "http://localhost:5000/api/empleadores-particular/login";
    } else {
      API = "http://localhost:5000/api/empleadores-empresa/login";
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log(data)
      if (!response.ok){
        if (response.status === 401){
          const errorData = await response.json();

          if(errorData.error) {
            setApiError(errorData.error);
          }
        } else {
          setApiError(`Error del servidor (${response.status})`);
        }
        return;
      }
      const responseData = await response.json();
      console.log(responseData);
      setApiError("");
      setSuccessMessage("Login exitoso. ¡Bienvenido!")

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (e) {
      setApiError(
        "Error de conexión. Por favor verifica tu conexión a internet."
      );
    }
  }

  

  return (
    <div className="modal-overlay">
      <div className="registro-form">
        <h2 style={{ textAlign: "center" }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>¿Qué eres?</label>
          <select
            {...register("tipo", { required: "Este campo es obligatorio" })}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="candidato">Candidato</option>
            <option value="empleadorParticular">Empleador Particular</option>
            <option value="empleadorEmpresa">Empleador de Empresa</option>
          </select>
          <label>Correo</label>
          <input
            {...register("correo", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Formato de correo inválido",
              },
            })}
            type="email"
          />
          {errors.correo && <p style={errorStyle}>{errors.correo.message}</p>}
          <label>Contraseña</label>
          <input
            {...register("contrasena", {
              required: "La contraseña es obligatoria",
            })}
            type="password"
          />
          {errors.contrasena && (
            <p style={errorStyle}>{errors.contrasena.message}</p>
          )}
          {errors.tipo && <p style={errorStyle}>{errors.tipo.message}</p>}

          {(apiError || successMessage) && (
            <div
              style={{
                color: "white",
                backgroundColor: apiError ? "red" : "green",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {apiError || successMessage}
            </div>
          )}
          <button type="submit" disabled={isSubmitting}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
