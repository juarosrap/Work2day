import "../styles/Profile.css"

export default function Profile() {
    return (
      <div className="main-profile">
        <div className="header-profile">
          <div className="banner" />
          <div className="profile-info">
            <div className="profile-photo">
              <img src="ruta-a-tu-foto-perfil.png" alt="Foto de perfil" />
            </div>
            <div className="profile-text">
              <h2 className="profile-name">Ana María Rodríguez</h2>
              <p className="profile-role">Desarrolladora Full Stack</p>
              <div className="profile-tags">
                <span className="tag">📍 Madrid, España</span>
                <span className="tag">✅ Disponible para trabajar</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-profile">
          <div className="resume-profile box">
            <h3>Resumen Profesional</h3>
            <p>
              Soy desarrollador de software y mi trabajo consiste principalmente
              en crear aplicaciones que resuelvan problemas reales. En el día a
              día, escribo código (mayormente en JavaScript y Python), colaboro
              con diseñadores y otros developers, reviso código de mis
              compañeros y participo en reuniones para definir qué vamos a
              construir y cómo.
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
                <p className="job-title">
                  Desarrolladora Senior - TechSolutions
                </p>
                <p className="job-dates">
                  Enero 2020 - Presente · 3 años 8 meses
                </p>
                <p className="job-description">
                  Lideré el desarrollo frontend de la plataforma principal
                  utilizando React y TypeScript. Implementé arquitecturas
                  serverless con AWS Lambda y optimicé el rendimiento de
                  aplicaciones existentes.
                </p>
              </div>
            </div>
            <div className="past-job">
              <img src="ruta-a-tu-imagen.png" alt="business-photo" />
              <div className="job-info">
                <p className="job-title">
                  Desarrolladora Senior - TechSolutions
                </p>
                <p className="job-dates">
                  Enero 2020 - Presente · 3 años 8 meses
                </p>
                <p className="job-description">
                  Lideré el desarrollo frontend de la plataforma principal
                  utilizando React y TypeScript. Implementé arquitecturas
                  serverless con AWS Lambda y optimicé el rendimiento de
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