import "../../styles/JobsDetails.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";

export default function JobsDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API = `http://localhost:5000/api/ofertas/${id}`;

    async function getJobs() {
      try {
        const response = await fetch(API);

        if (response.status === 404) {
          setError("El trabajo no fue encontrado.");
          return;
        }

        if (!response.ok) {
          throw new Error("Error inesperado en el servidor.");
        }

        const data = await response.json();
        setJob(data);
        
      } catch (err) {
        console.error("Error al obtener trabajos:", err);
        setError("Error al cargar los detalles del trabajo.");
      } finally {
        setLoading(false);
      }
    }
    getJobs();
  }, [id]);

  
  if (loading) return <div>Cargando...</div>;

  if (error) {
    return (
      <div className="main-detail">
        <h2 style={{ color: "red" }}>{error}</h2>
        <Link to="/jobs">Volver a la lista de trabajos</Link>
      </div>
    );
  }

  if (!job) return <div>Trabajo no disponible.</div>;

  return (
    <div className="main-detail">
      <div className="top-section">
        <h2>Job details</h2>
      </div>
      <div className="enterprise-section">
        <div className="left-side">Enterprise/Employer</div>
        <div className="right-side">
          <Link to={`/profile/${job.empleadorId}`}>
            {job.empleador.nombreEmpresa || job.empleador.nombre}
          </Link>
        </div>
      </div>
      <div className="application-section">
        <div className="left-side">Application for</div>
        <div className="right-side">{job.titulo}</div>
      </div>
      <div className="date-section">
        <div className="left-side">Date of the job</div>
        <div className="right-side">
          {dayjs(job.fechaInicio).format("DD/MM/YYYY")} -
          {dayjs(job.fechaFin).format("DD/MM/YYYY")}
        </div>
      </div>
      <div className="contact-section">
        <div className="left-side">Contact</div>
        <div className="right-side">{job.empleador.correo}</div>
      </div>
      <div className="salary-section">
        <div className="left-side">Salary expectation</div>
        <div className="right-side">{job.salario}</div>
      </div>
      <div className="about-section">
        <div className="left-side">About</div>
        <div className="right-side">{job.descripcion}</div>
      </div>
      <div className="attachments-section">
        <div className="left-side">Attachments</div>
        <div className="right-side">
          {currentUser && currentUser.userType === "candidato" ? (
            <button className="apply-button">
              <Link to={`/jobs/jobsDetail/${id}/apply`} className="link">
                Apply
              </Link>
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
