import "../styles/Profile.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Review from "./Review.jsx";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("Debes iniciar sesión para ver los perfiles");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        //const API = `http://localhost:5000/api/${currentUser.userType}/${id}`;
        
        const API = `http://localhost:5000/api/usuarios/${id}`;

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
        console.log(data.valoraciones)
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

  const renderCandidatoProfile = () => (
    <>
      <div className="header-profile">
        <div className="banner" />
        <div className="profile-info">
          <div className="profile-photo">
          {profile.fotoPerfil ? (
              <img src={profile.fotoPerfil} alt="Logo de empresa" />
              ) : (
              <img src="/ruta/a/imagen-por-defecto.png" alt="Logo por defecto" />
              )}
          </div>
          <div className="profile-text">
            <h2 className="profile-name">{profile.nombre}</h2>
            <p className="profile-role">
              {profile.curriculum?.experienciaLaboral || "No se ha especificado"}
            </p>
            <div className="profile-tags">
              {profile.curriculum && profile.curriculum.ubicacion && (
                <span className="tag">
                  📍 {profile.curriculum.ubicacion}, España
                </span>
              )}
              <span className="tag">✅ Disponible para trabajar</span>
            </div>
          </div>

          {currentUser.id === profile.id ?
            <div className="profile-edit">
            <button>
              <Link to="/profile/edit">Editar perfil</Link>
            </button>
          </div> : <div></div>}
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

        <div className="exp-profile box">
          <h3>Experiencia Destacada</h3>
          <div className="past-job">
            <img src="ruta-a-tu-imagen.png" alt="business-photo" />
            <div className="job-info">
              <p className="job-title">Desarrolladora Senior - TechSolutions</p>
              <p className="job-dates">
                Enero 2020 - Presente · 3 años 8 meses
              </p>
              <p className="job-description">
                Lideré el desarrollo frontend de la plataforma principal
                utilizando React y TypeScript. Implementé arquitecturas
                serverless con AWS Lambda y optimicé el rendimiento de
                aplicaciones existentes.
              </p>
            </div>
          </div>
          <div className="past-job">
            <img src="ruta-a-tu-imagen.png" alt="business-photo" />
            <div className="job-info">
              <p className="job-title">Desarrolladora Senior - TechSolutions</p>
              <p className="job-dates">
                Enero 2020 - Presente · 3 años 8 meses
              </p>
              <p className="job-description">
                Lideré el desarrollo frontend de la plataforma principal
                utilizando React y TypeScript. Implementé arquitecturas
                serverless con AWS Lambda y optimicé el rendimiento de
                aplicaciones existentes.
              </p>
            </div>
          </div>
        </div>

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

  const renderEmpleadorParticularProfile = () => (
    <>
      <div className="header-profile">
        <div className="banner" />
        <div className="profile-info">
          <div className="profile-photo">
          {profile.fotoPerfil ? (
              <img src={profile.fotoPerfil} alt="Logo de empresa" />
              ) : (
              <img src="/ruta/a/imagen-por-defecto.png" alt="Logo por defecto" />
              )}
          </div>
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

          {currentUser.id === profile.id ?
            <div className="profile-edit">
            <button>
              <Link to="/profile/edit">Editar perfil</Link>
            </button>
          </div> : <div></div>}
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
          <p>Basado en {profile.evaluaciones?.length || 0} evaluaciones</p>
          <p>{calcularMedia()}</p>
        </div>

        <div className="exp-profile box">
          <h3>Ofertas Publicadas</h3>
          {profile.ofertas && profile.ofertas.length > 0 ? (
            profile.ofertas.map((oferta, index) => (
              <div className="past-job" key={index}>
                <img src="ruta-a-tu-imagen.png" alt="job-photo" />
                <div className="job-info">
                  <p className="job-title">{oferta.titulo}</p>
                  <p className="job-dates">{oferta.duracion}</p>
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

  const renderEmpleadorEmpresaProfile = () => (
    <>
      <div className="header-profile">
        <div className="banner" />

        <div className="profile-info">
          <div className="profile-photo">
            {profile.fotoPerfil ? (
              <img src={profile.fotoPerfil} alt="Logo de empresa" />
              ) : (
              <img src="/ruta/a/imagen-por-defecto.png" alt="Logo por defecto" />
              )}
          </div>
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

          {currentUser.id === profile.id ?
            <div className="profile-edit">
            <button>
              <Link to="/profile/edit">Editar perfil</Link>
            </button>
          </div> : <div></div>}

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
          <p>Basado en {profile.evaluaciones?.length || 0} evaluaciones</p>
          <p>{calcularMedia()}</p>
        </div>

        <div className="exp-profile box">
          <h3>Ofertas Activas</h3>
          {profile.ofertas && profile.ofertas.length > 0 ? (
            profile.ofertas.map((oferta, index) => (
              <div className="past-job" key={index}>
                <img src="ruta-a-tu-imagen.png" alt="job-photo" />
                <div className="job-info">
                  <p className="job-title">{oferta.titulo}</p>
                  <p className="job-dates">
                    {oferta.duracion} - {oferta.ubicacion}
                  </p>
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

  return (
    <div className="main-profile">
      {profile.curriculum
        ? renderCandidatoProfile()
        : profile.nombreEmpresa
        ? renderEmpleadorEmpresaProfile()
        : renderEmpleadorParticularProfile()}
    </div>
  );
  
}
