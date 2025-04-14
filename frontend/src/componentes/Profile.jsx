import "../styles/Profile.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si authLoading es true, esperamos a que termine antes de continuar
    if (authLoading) return;

    // Si no hay usuario autenticado después de cargar, redirigimos al login
    if (!currentUser) {
      setError("Debes iniciar sesión para ver los perfiles");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const API = `http://localhost:5000/api/${currentUser.userType}/${id}`;
        console.log("Obteniendo perfil de:", API);

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
      } catch (err) {
        console.error("Error al obtener la persona:", err);
        setError("Error al cargar los detalles del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, authLoading]);

  
  if (authLoading || loading) return <div>Cargando...</div>;

  
  if (!currentUser) {
    return (
      <div className="main-detail">
        <h2>Necesitas iniciar sesión para ver este perfil</h2>
        <Link to="/login">Iniciar sesión</Link>
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

  
  return (
    <div className="main-profile">
      <div className="header-profile">
        <div className="banner" />
        <div className="profile-info">
          <div className="profile-photo">
            <img src="ruta-a-tu-foto-perfil.png" alt="Foto de perfil" />
          </div>
          <div className="profile-text">
            <h2 className="profile-name">{profile.nombre}</h2>
            <p className="profile-role">Desarrolladora Full Stack</p>
            <div className="profile-tags">
              {profile.curriculum && profile.curriculum.ubicacion && (
                <span className="tag">
                  📍 {profile.curriculum.ubicacion}, España
                </span>
              )}
              <span className="tag">✅ Disponible para trabajar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-profile">
        <div className="resume-profile box">
          <h3>Resumen Profesional</h3>
          <p>
            {profile.curriculum.informacionPersonal
              ? profile.curriculum.informacionPersonal
              : "No hay información personal disponible"}
          </p>
        </div>

        <div className="grades-profile box">
          <h3>Calificaciones</h3>
          <h5>Valoración general</h5>
          <p>Basado en 24 evaluaciones</p>
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

          <div className="review">
            <img src="ruta-a-imagen-carlos.png" alt="Carlos Mendoza" />
            <div className="review-content">
              <p className="review-name">Carlos Mendoza</p>
              <p className="review-role">Director de Tecnología,</p>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="review-text">
                Ana es una profesional excepcional. Su conocimiento técnico y
                capacidad para resolver
              </p>
            </div>
          </div>

          <div className="review">
            <img src="ruta-a-imagen-laura.png" alt="Laura Sánchez" />
            <div className="review-content">
              <p className="review-name">Laura Sánchez</p>
              <p className="review-role">Project Manager,</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
