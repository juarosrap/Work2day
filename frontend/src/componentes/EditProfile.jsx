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
  const [selectedFile, setSelectedFile] = useState(null);

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

        if (currentUser.userType === "candidato") {
          setValue("nombre", data.nombre || "");
          setValue("correo", data.correo || "");
          setValue("telefono", data.telefono || "");
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

            if (Array.isArray(data.curriculum.experienciaPrevia)) {
              data.curriculum.experienciaPrevia.forEach((exp, index) => {
                setValue(
                  `curriculum.experienciaPrevia.${index}.empresa`,
                  exp.empresa || ""
                );
                setValue(
                  `curriculum.experienciaPrevia.${index}.puesto`,
                  exp.puesto || ""
                );
                setValue(
                  `curriculum.experienciaPrevia.${index}.fechaInicio`,
                  formatDateForInput(exp.fechaInicio) || ""
                );
                setValue(
                  `curriculum.experienciaPrevia.${index}.fechaFin`,
                  formatDateForInput(exp.fechaFin) || ""
                );
                setValue(
                  `curriculum.experienciaPrevia.${index}.descripcion`,
                  exp.descripcion || ""
                );
              });
            }
          }
        } else if (currentUser.userType === "empleadorParticular") {
          setValue("nombre", data.nombre || "");
          // Asegurarse de que descripcion siempre tenga un valor, incluso si es una cadena vacía
          setValue("descripcion", data.descripcion || "");
          setValue("correo", data.correo || "");
          setValue("telefono", data.telefono || "");
          setValue(
            "fechaNacimiento",
            formatDateForInput(data.fechaNacimiento) || ""
          );
        } else if (currentUser.userType === "empleadorEmpresa") {
          setValue("nombre", data.nombre || "");
          setValue("correo", data.correo || "");
          setValue("telefono", data.telefono || "");
          setValue(
            "fechaNacimiento",
            formatDateForInput(data.fechaNacimiento) || ""
          );

          setValue("nombreEmpresa", data.nombreEmpresa || "");
          setValue("sector", data.sector || "");
          setValue("ubicacion", data.ubicacion || "");
          setValue("correoEmpresa", data.correoEmpresa || "");
          setValue("telefonoEmpresa", data.telefonoEmpresa || "");
          setValue("paginaWeb", data.paginaWeb || "");
          setValue("descripcion", data.descripcion || "");
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    setSuccessMessage("");

    // Para depurar
    console.log("Datos del formulario a enviar:", data);

    // Crear el objeto FormData
    const formData = new FormData();

    // Agregar campos básicos
    formData.append("nombre", data.nombre);
    formData.append("correo", data.correo);
    formData.append("telefono", data.telefono);
    formData.append("fechaNacimiento", data.fechaNacimiento);

    // Adjuntar la foto de perfil si se seleccionó
    if (selectedFile) {
      formData.append("fotoPerfil", selectedFile);
      console.log(
        "Foto adjuntada:",
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      );
    }

    if (currentUser.userType === "candidato") {
      // Información general del curriculum
      if (data.curriculum) {
        formData.append(
          "curriculum[informacionPersonal]",
          data.curriculum.informacionPersonal || ""
        );
        formData.append(
          "curriculum[ubicacion]",
          data.curriculum.ubicacion || ""
        );
        formData.append(
          "curriculum[formacionAcademica]",
          data.curriculum.formacionAcademica || ""
        );

        // Convertir idiomas a array y luego a string para el backend
        if (data.curriculum.idiomas) {
          const idiomasArray = data.curriculum.idiomas
            .split(",")
            .map((idioma) => idioma.trim())
            .filter((idioma) => idioma !== "");

          // Añadir cada idioma como un elemento del array
          idiomasArray.forEach((idioma, index) => {
            formData.append(`curriculum[idiomas][${index}]`, idioma);
          });
        }

        // Experiencia previa
        if (data.curriculum.experienciaPrevia) {
          for (let i = 0; i < 3; i++) {
            const exp = data.curriculum.experienciaPrevia[i];
            if (exp && exp.empresa) {
              formData.append(
                `curriculum[experienciaPrevia][${i}][empresa]`,
                exp.empresa || ""
              );
              formData.append(
                `curriculum[experienciaPrevia][${i}][puesto]`,
                exp.puesto || ""
              );
              formData.append(
                `curriculum[experienciaPrevia][${i}][fechaInicio]`,
                exp.fechaInicio || ""
              );
              formData.append(
                `curriculum[experienciaPrevia][${i}][fechaFin]`,
                exp.fechaFin || ""
              );
              formData.append(
                `curriculum[experienciaPrevia][${i}][descripcion]`,
                exp.descripcion || ""
              );
            }
          }
        }
      }
    } else if (currentUser.userType === "empleadorParticular") {
      // Siempre incluir la descripción, incluso si está vacía
      formData.append("descripcion", data.descripcion || "");
      console.log(
        "Descripcion enviada para empleadorParticular:",
        data.descripcion || ""
      );
    } else if (currentUser.userType === "empleadorEmpresa") {
      formData.append("nombreEmpresa", data.nombreEmpresa || "");
      formData.append("sector", data.sector || "");
      formData.append("ubicacion", data.ubicacion || "");
      formData.append("correoEmpresa", data.correoEmpresa || "");
      formData.append("telefonoEmpresa", data.telefonoEmpresa || "");
      formData.append("paginaWeb", data.paginaWeb || "");
      formData.append("descripcion", data.descripcion || "");
    }

    // Log de los datos del FormData para depuración
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const API = `http://localhost:5000/api/${currentUser.userType}/${currentUser.id}`;
      console.log("Sending update to:", API);

      const response = await fetch(API, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      console.log("Respuesta recibida:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(
          errorData.error ||
            errorData.message ||
            "Error al actualizar el perfil"
        );
        return;
      }

      const updatedData = await response.json();
      console.log("Updated data received:", updatedData);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="registro-form"
      encType="multipart/form-data"
    >
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
          <label>Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e)}
            name="fotoPerfil"
          />
          {selectedFile && (
            <p className="file-info">
              Imagen seleccionada: {selectedFile.name}
            </p>
          )}
          {profileData?.fotoPerfil && !selectedFile && (
            <p className="file-info">
              Imagen actual: {profileData.fotoPerfil.split("/").pop()}
            </p>
          )}
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
        <label>Idiomas (separados por coma)</label>
        <input {...register("curriculum.idiomas")} type="text" />
      </div>

      <div>
        <h3>Experiencia laboral previa</h3>

        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="exp-profile box"
            style={{ marginBottom: "20px" }}
          >
            <div className="past-job">
              <div className="job-info">
                <div>
                  <label>Empresa</label>
                  <input
                    {...register(
                      `curriculum.experienciaPrevia.${index}.empresa`
                    )}
                    type="text"
                  />
                </div>

                <div>
                  <label>Puesto</label>
                  <input
                    {...register(
                      `curriculum.experienciaPrevia.${index}.puesto`
                    )}
                    type="text"
                  />
                </div>

                <div className="row">
                  <div>
                    <label>Fecha de inicio</label>
                    <input
                      {...register(
                        `curriculum.experienciaPrevia.${index}.fechaInicio`
                      )}
                      type="date"
                    />
                  </div>

                  <div>
                    <label>Fecha de fin</label>
                    <input
                      {...register(
                        `curriculum.experienciaPrevia.${index}.fechaFin`
                      )}
                      type="date"
                    />
                  </div>
                </div>

                <div>
                  <label>Descripción</label>
                  <textarea
                    {...register(
                      `curriculum.experienciaPrevia.${index}.descripcion`
                    )}
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderFormActions()}
    </form>
  );

  const renderEmpleadorParticularForm = () => (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="registro-form"
      encType="multipart/form-data"
    >
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
          <label>Descripción</label>
          <textarea
            {...register("descripcion")}
            rows="3"
            placeholder="Describe tu perfil profesional"
          />
          {errors.descripcion && (
            <span className="error">{errors.descripcion.message}</span>
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
          <label>Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e)}
            name="fotoPerfil"
          />
          {selectedFile && (
            <p className="file-info">
              Imagen seleccionada: {selectedFile.name}
            </p>
          )}
          {profileData?.fotoPerfil && !selectedFile && (
            <p className="file-info">
              Imagen actual: {profileData.fotoPerfil.split("/").pop()}
            </p>
          )}
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="registro-form"
      encType="multipart/form-data"
    >
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
          <label>Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e)}
            name="fotoPerfil"
          />
          {selectedFile && (
            <p className="file-info">
              Imagen seleccionada: {selectedFile.name}
            </p>
          )}
          {profileData?.fotoPerfil && !selectedFile && (
            <p className="file-info">
              Imagen actual: {profileData.fotoPerfil.split("/").pop()}
            </p>
          )}
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
          <label>Descripción</label>
          <textarea
            {...register("descripcion")}
            rows="3"
            placeholder="Describe tu empresa"
          />
          {errors.descripcion && (
            <span className="error">{errors.descripcion.message}</span>
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
        <label>Foto de la empresa</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e)}
          name="fotoEmpresa"
        />
        {selectedFile && selectedFile.name === "fotoEmpresa" && (
          <p className="file-info">Imagen seleccionada: {selectedFile.name}</p>
        )}
        {profileData?.fotoEmpresa && !selectedFile && (
          <p className="file-info">
            Imagen actual: {profileData.fotoEmpresa.split("/").pop()}
          </p>
        )}
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
