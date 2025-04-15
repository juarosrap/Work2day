import "../styles/DashBoard.css";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashBoardRow from "./DashboardRow";

export default function DashBoard() {
    const { id } = useParams();
    const [jobs, setJobs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const API = `http://localhost:5000/api/ofertas/empleador/${id}`;

        async function getData() {
            try {
              const response = await fetch(API);

              if (response.status === 404) {
                setError("El empleador no fue encontrado.");
                return;
              }

              if (!response.ok) {
                throw new Error("Error inesperado en el servidor.");
              }

              const data = await response.json();
              console.log(data);
              setJobs(data);
            } catch (e) {
              console.error("Error al obtener trabajos:", e);
              setError("Error al cargar los detalles del trabajo.");
            } finally {
              setLoading(false);
            }
        }

        getData();
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

  return (
    <div className="main-dash">
      <div className="title-dash">
        <h2>Dashboard</h2>
        <button className="add-job">
          <Link to={`/dashboard/${id}/jobForm`}>+ Nueva oferta de trabajo</Link>
        </button>
      </div>

      <div className="statistics-dash">
        <div className="stat-card">
          <p>Ofertas activas</p>
          <p className="active">12</p>
        </div>
        <div className="stat-card">
          <p>Candidatos totales</p>
          <p className="total">12</p>
        </div>
        <div className="stat-card">
          <p>Puestos cubiertos</p>
          <p className="filled">12</p>
        </div>
      </div>

      <div className="data-dash">
        <h2>Mis ofertas publicadas</h2>
        <div className="search-dash">
          <input placeholder="Buscar ofertas..." />
        </div>

        <div className="job-table">
          <div className="table-header">
            <div className="header-cell">TÍTULO</div>
            <div className="header-cell">ESTADO</div>
            <div className="header-cell">CANDIDATOS</div>
            <div className="header-cell">FECHA</div>
            <div className="header-cell">ACCIONES</div>
          </div>

          {jobs.map((job) => (
            <DashBoardRow key={job.id} job={job} />
          ))}

          {/* <div className="table-row">
                    <div className="cell" data-label="TÍTULO">
                        <p>Camarero para eventos</p>
                        <span className="subtitle">Madrid, España</span>
                    </div>
                    <div className="cell" data-label="ESTADO">
                        <span className="status active">Activa</span>
                    </div>
                    <div className="cell" data-label="CANDIDATOS">
                        8   
                    </div>
                    <div className="cell" data-label="FECHA">
                        20/03/2025
                    </div>
                    <div className="cell actions" data-label="ACCIONES">
                        <span className="edit">Editar</span>
                        <span className="delete">Eliminar</span>
                    </div>
                </div>

                <div className="table-row">
                    <div className="cell" data-label="TÍTULO">
                        <p>Vigilante y organizador</p>
                        <span className="subtitle">Sevilla, España</span>
                    </div>
                    <div className="cell" data-label="ESTADO">
                        <span className="status paused">Pausada</span>
                    </div>
                    <div className="cell" data-label="CANDIDATOS">
                        12
                    </div>
                    <div className="cell" data-label="FECHA">
                        15/01/2025
                    </div>
                    <div className="cell actions" data-label="ACCIONES">
                        <span className="edit">Editar</span>
                        <span className="delete">Eliminar</span>
                    </div>
                </div> */}
        </div>
      </div>
    </div>
  );
}
