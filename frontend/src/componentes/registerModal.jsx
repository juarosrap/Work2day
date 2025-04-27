import { useState } from "react";
import "../styles/ModalForm.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function ModalForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  let API = "http://localhost:5000/api/";

  const [apiError, setApiError] = useState("");
  const [tipo, setTipo] = useState("candidato");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const password = watch("contrasena");

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
    marginBottom: "8px",
  };

  const camposBase = (
    <>
      <div className="row">
        <div>
          <label>Nombre</label>
          <input
            {...register("nombre", { required: "Este campo es obligatorio" })}
          />
          {errors.nombre && <p style={errorStyle}>{errors.nombre.message}</p>}
        </div>
        <div>
          <label>Teléfono</label>
          <input
            {...register("telefono", { required: "Este campo es obligatorio" })}
          />
          {errors.telefono && (
            <p style={errorStyle}>{errors.telefono.message}</p>
          )}
        </div>
      </div>
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

      <label>Fecha de nacimiento</label>
      <input
        {...register("fechaNacimiento", {
          required: "Este campo es obligatorio",
        })}
        type="date"
      />
      {errors.fechaNacimiento && (
        <p style={errorStyle}>{errors.fechaNacimiento.message}</p>
      )}

      <label>Contraseña</label>
      <input
        {...register("contrasena", {
          required: "Este campo es obligatorio",
          minLength: {
            value: 6,
            message: "La contraseña debe tener al menos 6 caracteres",
          },
        })}
        type="password"
      />
      {errors.contrasena && (
        <p style={errorStyle}>{errors.contrasena.message}</p>
      )}

      <label>Confirmar Contraseña</label>
      <input
        {...register("confirmarContrasena", {
          required: "Este campo es obligatorio",
          validate: (value) =>
            value === password || "Las contraseñas no coinciden",
        })}
        type="password"
      />
      {errors.confirmarContrasena && (
        <p style={errorStyle}>{errors.confirmarContrasena.message}</p>
      )}

      <label>Foto de perfil (URL)</label>
      <input {...register("fotoPerfil")} />
    </>
  );

  const camposEmpresa = tipo === "empleadorEmpresa" && (
    <>
      <label>Nombre de la empresa</label>
      <input
        {...register("nombreEmpresa", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.nombreEmpresa && (
        <p style={errorStyle}>{errors.nombreEmpresa.message}</p>
      )}

      <label>Sector</label>
      <input
        {...register("sector", { required: "Este campo es obligatorio" })}
      />
      {errors.sector && <p style={errorStyle}>{errors.sector.message}</p>}

      <label>Ubicación</label>
      <input
        {...register("ubicacion", { required: "Este campo es obligatorio" })}
      />
      {errors.ubicacion && <p style={errorStyle}>{errors.ubicacion.message}</p>}

      <label>Foto de empresa (URL)</label>
      <input {...register("fotoEmpresa")} />

      <label>Correo de empresa</label>
      <input
        {...register("correoEmpresa", {
          required: "Este campo es obligatorio",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Formato de correo inválido",
          },
        })}
        type="email"
      />
      {errors.correoEmpresa && (
        <p style={errorStyle}>{errors.correoEmpresa.message}</p>
      )}

      <label>Teléfono de empresa</label>
      <input
        {...register("telefonoEmpresa", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.telefonoEmpresa && (
        <p style={errorStyle}>{errors.telefonoEmpresa.message}</p>
      )}

      <label>Página web</label>
      <input
        {...register("paginaWeb", { required: "Este campo es obligatorio" })}
      />
      {errors.paginaWeb && <p style={errorStyle}>{errors.paginaWeb.message}</p>}
    </>
  );

  const camposCurriculum = tipo === "candidato" && (
    <>
      <hr />
      <h3 style={{ textAlign: "center" }}>Currículum</h3>
      <label>Información Personal</label>
      <input
        {...register("curriculum.informacionPersonal", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.curriculum?.informacionPersonal && (
        <p style={errorStyle}>
          {errors.curriculum.informacionPersonal.message}
        </p>
      )}

      <label>Ubicación</label>
      <input
        {...register("curriculum.ubicacion", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.curriculum?.ubicacion && (
        <p style={errorStyle}>{errors.curriculum.ubicacion.message}</p>
      )}

      <label>Formación Académica</label>
      <input
        {...register("curriculum.formacionAcademica", {
          required: "Este campo es obligatorio",
        })}
      />
      {errors.curriculum?.formacionAcademica && (
        <p style={errorStyle}>{errors.curriculum.formacionAcademica.message}</p>
      )}

      <label>Idiomas (separados por coma)</label>
      <input
        {...register("idiomasRaw", { required: "Este campo es obligatorio" })}
      />
      {errors.idiomasRaw && (
        <p style={errorStyle}>{errors.idiomasRaw.message}</p>
      )}

      <h3>Experiencia Laboral</h3>

      <label>Empresa</label>
      <input
        {...register("curriculum.experienciaPrevia.empresa")}
        placeholder="Nombre de la empresa"
      />

      <label>Puesto</label>
      <input
        {...register("curriculum.experienciaPrevia.puesto")}
        placeholder="Tu puesto en la empresa"
      />

      <label>Fecha de Inicio</label>
      <input
        {...register("curriculum.experienciaPrevia.fechaInicio")}
        type="date"
      />

      <label>Fecha de Fin</label>
      <input
        {...register("curriculum.experienciaPrevia.fechaFin")}
        type="date"
      />

      <label>Descripción</label>
      <textarea
        {...register("curriculum.experienciaPrevia.descripcion")}
        placeholder="Describe tus tareas o logros"
      />
    </>
  );

  const onSubmit = async (data) => {
    if (data.tipo === "candidato") {
      API = "http://localhost:5000/api/candidato/register";

      
      if (data.idiomasRaw) {
        const idiomasArray = data.idiomasRaw
          .split(",")
          .map((idioma) => idioma.trim())
          .filter((idioma) => idioma !== "");

        data.curriculum.idiomas = idiomasArray;
      }

      
      delete data.idiomasRaw;
    } else if (data.tipo === "empleadorParticular") {
      API = "http://localhost:5000/api/empleadorParticular/register";
    } else {
      API = "http://localhost:5000/api/empleadorEmpresa/register";
    }

    if (
      data.curriculum?.experienciaPrevia &&
      data.curriculum.experienciaPrevia.empresa
    ) {
      data.curriculum.experienciaPrevia = [data.curriculum.experienciaPrevia];
    } else {
      delete data.curriculum.experienciaPrevia;
    }


    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.error) {
            setApiError(errorData.error);
          }
        } else {
          setApiError(`Error del servidor (${response.status})`);
        }
        return;
      }

      setApiError("");
      setSuccessMessage("Registro exitoso. ¡Bienvenido!");

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (e) {
      console.error("Error:", e);
      setApiError(
        "Error de conexión. Por favor verifica tu conexión a internet."
      );
    }
  };

  return (
    <form className="registro-form" onSubmit={handleSubmit(onSubmit)}>
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
      {errors.tipo && <p style={errorStyle}>{errors.tipo.message}</p>}

      {camposBase}
      {camposEmpresa}
      {camposCurriculum}

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
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
