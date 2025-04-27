import "../styles/ModalForm.css";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Función para formatear la fecha a formato YYYY-MM-DD para input date
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/loginForm");
      return;
    }

    setIsLoading(true);
    const API = `http://localhost:5000/api/${currentUser.userType}/${currentUser.id}`;

    const getProfile = async () => {
      try {
        const response = await fetch(API, {
          credentials: "include",
        });

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
        setProfileData(data);

        // Aquí eliminamos el bucle y establecemos manualmente los valores según el tipo de usuario
        if (currentUser.userType === "candidato") {
          // Establecer datos básicos de candidato
          setValue("nombre", data.nombre || "");
          setValue("correo", data.correo || "");
          setValue("telefono", data.telefono || "");
          setValue("fotoPerfil", data.fotoPerfil || "");
          setValue(
            "fechaNacimiento",
            formatDateForInput(data.fechaNacimiento) || ""
          );

          if (data.curriculum) {
            setValue(
              "curriculum.informacionPersonal",
              data.curriculum.informacionPersonal || ""
            );
            setValue("curriculum.ubicacion", data.curriculum.ubicacion || "");
            setValue(
              "curriculum.formacionAcademica",
              data.curriculum.formacionAcademica || ""
            );
            setValue(
              "curriculum.experienciaLaboral",
              data.curriculum.experienciaLaboral || ""
            );

            if (Array.isArray(data.curriculum.idiomas)) {
              setValue(
                "curriculum.idiomas",
                data.curriculum.idiomas.join(", ") || ""
              );
            } else {
              setValue("curriculum.idiomas", data.curriculum.idiomas || "");
            }
          }
        } else if (currentUser.userType === "empleadorParticular") {
          setValue("nombre", data.nombre || "");
          setValue("correo", data.correo || "");
          setValue("telefono", data.telefono || "");
          setValue("fotoPerfil", data.fotoPerfil || "");
          setValue(
            "fechaNacimiento",
            formatDateForInput(data.fechaNacimiento) || ""
          );
        } else if (currentUser.userType === "empleadorEmpresa") {
          
          setValue("nombre", data.nombre || "");
          setValue("correo", data.correo || "");
          setValue("telefono", data.telefono || "");
          setValue("fotoPerfil", data.fotoPerfil || "");
          setValue(
            "fechaNacimiento",
            formatDateForInput(data.fechaNacimiento) || ""
          );

          setValue("nombreEmpresa", data.nombreEmpresa || "");
          setValue("sector", data.sector || "");
          setValue("ubicacion", data.ubicacion || "");
          setValue("fotoEmpresa", data.fotoEmpresa || "");
          setValue("correoEmpresa", data.correoEmpresa || "");
          setValue("telefonoEmpresa", data.telefonoEmpresa || "");
          setValue("paginaWeb", data.paginaWeb || "");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setApiError("Error de conexión al obtener los datos del usuario");
        setIsLoading(false);
      }
    };

    getProfile();
  }, [currentUser, navigate, setValue]);

  const onSubmit = async (data) => {
    setApiError("");
    setSuccessMessage("");

    const processedData = { ...data };

    if (processedData.curriculum && processedData.curriculum.idiomas) {
      processedData.curriculum.idiomas = processedData.curriculum.idiomas
        .split(",")
        .map((idioma) => idioma.trim())
        .filter((idioma) => idioma !== ""); 
    }

    try {
      const API = `http://localhost:5000/api/${currentUser.userType}/${currentUser.id}`;

      const response = await fetch(API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.message || "Error al actualizar el perfil");
        return;
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setSuccessMessage("Perfil actualizado correctamente");

      setTimeout(() => {
        navigate(`/profile/${currentUser.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setApiError("Error de conexión al actualizar el perfil");
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${currentUser.id}`);
  };

  const renderCandidatoForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
      <h3>Información personal</h3>
      <div className="row">
        <div>
          <label>Nombre</label>
          <input
            {...register("nombre", { required: "Este campo es obligatorio" })}
            type="text"
          />
          {errors.nombre && (
            <span className="error">{errors.nombre.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>Correo electrónico</label>
          <input
            {...register("correo", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido",
              },
            })}
            type="email"
          />
          {errors.correo && (
            <span className="error">{errors.correo.message}</span>
          )}
        </div>

        <div>
          <label>Teléfono</label>
          <input
            {...register("telefono", { required: "Este campo es obligatorio" })}
            type="tel"
          />
          {errors.telefono && (
            <span className="error">{errors.telefono.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>URL de la foto de perfil</label>
          <input {...register("fotoPerfil")} type="text" />
        </div>

        <div>
          <label>Fecha de nacimiento</label>
          <input
            {...register("fechaNacimiento", {
              required: "Este campo es obligatorio",
            })}
            type="date"
          />
          {errors.fechaNacimiento && (
            <span className="error">{errors.fechaNacimiento.message}</span>
          )}
        </div>
      </div>

      <h3>Información del curriculum</h3>

      <div>
        <label>Información personal</label>
        <textarea {...register("curriculum.informacionPersonal")} rows="3" />
      </div>

      <div className="row">
        <div>
          <label>Ubicación</label>
          <input {...register("curriculum.ubicacion")} type="text" />
        </div>
      </div>

      <div>
        <label>Formación académica</label>
        <textarea {...register("curriculum.formacionAcademica")} rows="3" />
      </div>

      <div>
        <label>Experiencia laboral</label>
        <textarea {...register("curriculum.experienciaLaboral")} rows="3" />
      </div>

      <div>
        <label>Idiomas (separados por coma)</label>
        <input {...register("curriculum.idiomas")} type="text" />
      </div>

      {renderFormActions()}
    </form>
  );

  const renderEmpleadorParticularForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
      <h3>Información personal</h3>
      <div className="row">
        <div>
          <label>Nombre</label>
          <input
            {...register("nombre", { required: "Este campo es obligatorio" })}
            type="text"
          />
          {errors.nombre && (
            <span className="error">{errors.nombre.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>Correo electrónico</label>
          <input
            {...register("correo", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido",
              },
            })}
            type="email"
          />
          {errors.correo && (
            <span className="error">{errors.correo.message}</span>
          )}
        </div>

        <div>
          <label>Teléfono</label>
          <input
            {...register("telefono", { required: "Este campo es obligatorio" })}
            type="tel"
          />
          {errors.telefono && (
            <span className="error">{errors.telefono.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>URL de la foto de perfil</label>
          <input {...register("fotoPerfil")} type="text" />
        </div>

        <div>
          <label>Fecha de nacimiento</label>
          <input
            {...register("fechaNacimiento", {
              required: "Este campo es obligatorio",
            })}
            type="date"
          />
          {errors.fechaNacimiento && (
            <span className="error">{errors.fechaNacimiento.message}</span>
          )}
        </div>
      </div>

      {renderFormActions()}
    </form>
  );

  const renderEmpleadorEmpresaForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
      <h3>Información personal</h3>
      <div className="row">
        <div>
          <label>Nombre</label>
          <input
            {...register("nombre", { required: "Este campo es obligatorio" })}
            type="text"
          />
          {errors.nombre && (
            <span className="error">{errors.nombre.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>Correo electrónico</label>
          <input
            {...register("correo", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido",
              },
            })}
            type="email"
          />
          {errors.correo && (
            <span className="error">{errors.correo.message}</span>
          )}
        </div>

        <div>
          <label>Teléfono</label>
          <input
            {...register("telefono", { required: "Este campo es obligatorio" })}
            type="tel"
          />
          {errors.telefono && (
            <span className="error">{errors.telefono.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>URL de la foto de perfil</label>
          <input {...register("fotoPerfil")} type="text" />
        </div>

        <div>
          <label>Fecha de nacimiento</label>
          <input
            {...register("fechaNacimiento", {
              required: "Este campo es obligatorio",
            })}
            type="date"
          />
          {errors.fechaNacimiento && (
            <span className="error">{errors.fechaNacimiento.message}</span>
          )}
        </div>
      </div>

      <h3>Información de la empresa</h3>
      <div className="row">
        <div>
          <label>Nombre de la empresa</label>
          <input
            {...register("nombreEmpresa", {
              required: "Este campo es obligatorio",
            })}
            type="text"
          />
          {errors.nombreEmpresa && (
            <span className="error">{errors.nombreEmpresa.message}</span>
          )}
        </div>

        <div>
          <label>Sector</label>
          <input
            {...register("sector", { required: "Este campo es obligatorio" })}
            type="text"
          />
          {errors.sector && (
            <span className="error">{errors.sector.message}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div>
          <label>Ubicación</label>
          <input {...register("ubicacion")} type="text" />
        </div>
      </div>

      <div>
        <label>URL de la foto de la empresa</label>
        <input {...register("fotoEmpresa")} type="text" />
      </div>

      <div className="row">
        <div>
          <label>Correo electrónico de la empresa</label>
          <input
            {...register("correoEmpresa", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo electrónico inválido",
              },
            })}
            type="email"
          />
          {errors.correoEmpresa && (
            <span className="error">{errors.correoEmpresa.message}</span>
          )}
        </div>

        <div>
          <label>Teléfono de la empresa</label>
          <input
            {...register("telefonoEmpresa", {
              required: "Este campo es obligatorio",
            })}
            type="tel"
          />
          {errors.telefonoEmpresa && (
            <span className="error">{errors.telefonoEmpresa.message}</span>
          )}
        </div>
      </div>

      <div>
        <label>Página web</label>
        <input {...register("paginaWeb")} type="text" />
      </div>

      {renderFormActions()}
    </form>
  );

  const renderFormActions = () => (
    <>
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

      <div className="form-buttons">
        <button type="button" onClick={handleCancel} className="cancel-btn">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="modal-background">
        <div className="modal-container modal-loading">
          <h2 style={{ textAlign: "center" }}>Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="modal-background">
        <div className="modal-container">
          <h2 style={{ textAlign: "center" }}>
            Necesitas iniciar sesión para editar tu perfil
          </h2>
          <button onClick={() => navigate("/loginForm")}>Iniciar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-background">
      <div className="modal-container with-scroll">
        <h2 style={{ textAlign: "center" }}>Editar perfil</h2>

        {currentUser.userType === "candidato" && renderCandidatoForm()}
        {currentUser.userType === "empleadorParticular" &&
          renderEmpleadorParticularForm()}
        {currentUser.userType === "empleadorEmpresa" &&
          renderEmpleadorEmpresaForm()}
      </div>
    </div>
  );
}
