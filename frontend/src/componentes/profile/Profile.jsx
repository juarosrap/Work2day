import "../../styles/Profile.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Review from "./Review.jsx";
import ExperienciaDestacada from "./ExperienciaDestacada.jsx";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import defaultAvatar from "../../assets/default-avatar.jpg";


const API_URL = "http://localhost:5000";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);


  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("Debes iniciar sesión para ver los perfiles");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const API = `${API_URL}/api/usuarios/${id}`;

        const response = await fetch(API, {
          credentials: "include",
        });

        if (response.status === 404) {
          setError("La persona no existe");
          return;
        }

        if (!response.ok) {
          throw new Error("Error inesperado en el servidor.");
        }

        const data = await response.json();
        
        setProfile(data);
        setImageError(false);
      } catch (err) {
        console.error("Error al obtener la persona:", err);
        setError("Error al cargar los detalles del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, authLoading]);

  const calcularMedia = () => {
    if (
      !profile ||
      !profile.valoraciones ||
      profile.valoraciones.length === 0
    ) {
      return 0;
    }

    let sum = 0;
    for (let valoracion of profile.valoraciones) {
      sum += valoracion.puntuacion;
    }

    return (sum / profile.valoraciones.length).toFixed(1);
  };


  const renderProfilePhoto = (photoUrl) => {
    return (
      <div className="profile-photo">
        {photoUrl ? (
          <img
            src={`${API_URL}${photoUrl}`}
            alt="Foto de perfil"
            onError={() => setImageError(true)}
            style={{ display: imageError ? "none" : "block" }}
          />
        ) : (
          <img src={defaultAvatar} alt="Foto por defecto" />
        )}
        {photoUrl && imageError && (
          <img src={defaultAvatar} alt="Foto por defecto" />
        )}
      </div>
    );
  };

  if (authLoading || loading) return <div>Cargando...</div>;

  if (!currentUser) {
    return (
      <div className="main-detail">
        <h2>Necesitas iniciar sesión para ver este perfil</h2>
        <Link to="/loginForm">Iniciar sesión</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-detail">
        <h2 style={{ color: "red" }}>{error}</h2>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  if (!profile) {
    return <div>No se encontró el perfil</div>;
  }

  const renderCandidatoProfile = () => {
    const experienciasLimitadas =
      profile.curriculum && profile.curriculum.experienciaPrevia
        ? profile.curriculum.experienciaPrevia.slice(0, 3)
        : [];

    return (
      <>
        <div className="header-profile">
          <div className="banner" />
          <div className="profile-info">
            {renderProfilePhoto(profile.fotoPerfil)}
            <div className="profile-text">
              <h2 className="profile-name">{profile.nombre}</h2>
              <div className="profile-tags">
                {profile.curriculum && profile.curriculum.ubicacion && (
                  <span className="tag">
                    📍 {profile.curriculum.ubicacion}, España
                  </span>
                )}
              </div>
            </div>

            {currentUser.id === profile.id ? (
              <div className="profile-edit">
                <button>
                  <Link to="/profile/edit">Editar perfil</Link>
                </button>
                <button>
                  <Link to="/change-password">Cambiar contraseña</Link>
                </button>
                <button className="delete-account">
                  <Link to="/delete-account">Eliminar cuenta</Link>
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        <div className="bottom-profile">
          <div className="resume-profile box">
            <h3>Resumen Profesional</h3>
            <p>
              {profile.curriculum && profile.curriculum.informacionPersonal
                ? profile.curriculum.informacionPersonal
                : "No hay información personal disponible"}
            </p>
          </div>

          <div className="grades-profile box">
            <h3>Calificaciones</h3>
            <h5>Valoración general</h5>
            <p>Basado en {profile.valoraciones?.length || 0} evaluaciones</p>
            <p>{calcularMedia()}</p>
          </div>

          <ExperienciaDestacada experienciaPrevia={experienciasLimitadas} />

          <div className="opinions-profile box">
            <h3>Reseñas Recientes</h3>
            {profile.valoraciones && profile.valoraciones.length > 0 ? (
              profile.valoraciones.map((review) => (
                <Review key={review.id} review={review} />
              ))
            ) : (
              <p>No hay reseñas disponibles</p>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderEmpleadorParticularProfile = () => {
    const ofertasLimitadas = profile.ofertas ? profile.ofertas.slice(0, 3) : [];

    return (
      <>
        <div className="header-profile">
          <div className="banner" />
          <div className="profile-info">
            {renderProfilePhoto(profile.fotoPerfil)}
            <div className="profile-text">
              <h2 className="profile-name">
                {profile.nombre} {profile.apellidos || ""}
              </h2>
              <p className="profile-role">Empleador Particular</p>
              <div className="profile-tags">
                {profile.ubicacion && (
                  <span className="tag">📍 {profile.ubicacion}</span>
                )}
                <span className="tag">✉️ {profile.correo}</span>
              </div>
            </div>

            {currentUser.id === profile.id ? (
              <div className="profile-edit">
                <button>
                  <Link to="/profile/edit">Editar perfil</Link>
                </button>
                <button>
                  <Link to="/change-password">Cambiar contraseña</Link>
                </button>
                <button className="delete-account">
                  <Link to="/delete-account">Eliminar cuenta</Link>
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        <div className="bottom-profile">
          <div className="resume-profile box">
            <h3>Sobre mí</h3>
            <p>{profile.descripcion || "No hay información disponible"}</p>
          </div>

          <div className="grades-profile box">
            <h3>Calificaciones como Empleador</h3>
            <h5>Valoración general</h5>
            <p>Basado en {profile.valoraciones?.length || 0} valoraciones</p>
            <p>{calcularMedia()}</p>
          </div>

          <div className="exp-profile box">
            <h3>3 Últimas Ofertas Activas</h3>
            {ofertasLimitadas.length > 0 ? (
              ofertasLimitadas.map((oferta, index) => (
                <div className="past-job" key={index}>
                  {oferta.imagen ? (
                    <img
                      src={`${API_URL}/${oferta.imagen}`}
                      alt="Imagen de oferta"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/default-job.png";
                      }}
                    />
                  ) : (
                    <img
                      src="/assets/default-job.png"
                      alt="Imagen por defecto"
                    />
                  )}
                  <div className="job-info">
                    <p className="job-title">{oferta.titulo}</p>
                    <div className="duration">
                      <p className="job-dates">
                        Publicada el{" "}
                        {dayjs(oferta.fechaPublicacion).format("DD/MM/YYYY")}
                      </p>
                      <p className="job-dates">Duración: {oferta.duracion}</p>
                    </div>
                    <p className="job-description">{oferta.descripcion}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay ofertas publicadas</p>
            )}
          </div>

          <div className="opinions-profile box">
            <h3>Reseñas de Candidatos</h3>
            {profile.valoraciones && profile.valoraciones.length > 0 ? (
              profile.valoraciones.map((review) => (
                <Review key={review.id} review={review} />
              ))
            ) : (
              <p>No hay reseñas disponibles</p>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderEmpleadorEmpresaProfile = () => {
    const ofertasLimitadas = profile.ofertas ? profile.ofertas.slice(0, 3) : [];

    return (
      <>
        <div className="header-profile">
          <div className="banner" />

          <div className="profile-info">
            {renderProfilePhoto(profile.fotoPerfil)}
            <div className="profile-text">
              <h2 className="profile-name">
                {profile.nombreEmpresa || profile.nombre}
              </h2>
              <p className="profile-role">{profile.sector || "Empresa"}</p>
              <div className="profile-tags">
                {profile.ubicacion && (
                  <span className="tag">📍 {profile.ubicacion}</span>
                )}
                <span className="tag">
                  🌐 {profile.paginaWeb || "Sin sitio web"}
                </span>
              </div>
            </div>

            {currentUser.id === profile.id ? (
              <div className="profile-edit">
                <button>
                  <Link to="/profile/edit">Editar perfil</Link>
                </button>
                <button>
                  <Link to="/change-password">Cambiar contraseña</Link>
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        <div className="bottom-profile">
          <div className="resume-profile box">
            <h3>Sobre la empresa</h3>
            <p>
              {profile.descripcion ||
                "No hay información disponible sobre esta empresa"}
            </p>
          </div>

          <div className="grades-profile box">
            <h3>Calificaciones como Empleador</h3>
            <h5>Valoración general</h5>
            <p>Basado en {profile.valoraciones?.length || 0} valoraciones</p>
            <p>{calcularMedia()}</p>
          </div>

          <div className="exp-profile box">
            <h3>3 Últimas Ofertas Activas</h3>
            {ofertasLimitadas.length > 0 ? (
              ofertasLimitadas.map((oferta, index) => (
                <div className="past-job" key={index}>
                  {oferta.imagen ? (
                    <img
                      src={`${API_URL}/${oferta.imagen}`}
                      alt="Imagen de oferta"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/default-job.png";
                      }}
                    />
                  ) : (
                    <img
                      src="/assets/default-job.png"
                      alt="Imagen por defecto"
                    />
                  )}
                  <div className="job-info">
                    <p className="job-title">{oferta.titulo}</p>
                    <div className="duration">
                      <p className="job-dates">
                        Publicada el{" "}
                        {dayjs(oferta.fechaPublicacion).format("DD/MM/YYYY")}
                      </p>
                      <p className="job-dates">Duración: {oferta.duracion}</p>
                    </div>
                    <p className="job-description">{oferta.descripcion}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay ofertas activas</p>
            )}
          </div>

          <div className="opinions-profile box">
            <h3>Opiniones de Empleados y Candidatos</h3>
            {profile.valoraciones && profile.valoraciones.length > 0 ? (
              profile.valoraciones.map((review) => (
                <Review key={review.id} review={review} />
              ))
            ) : (
              <p>No hay reseñas disponibles</p>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="main-profile"
    >
      {profile.curriculum
        ? renderCandidatoProfile()
        : profile.nombreEmpresa
        ? renderEmpleadorEmpresaProfile()
        : renderEmpleadorParticularProfile()}
    </motion.div>
  );
}
