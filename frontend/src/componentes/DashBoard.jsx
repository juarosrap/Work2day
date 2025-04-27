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
              // console.log(data);
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

    const numCandidatos = () => {
      let cont = 0;

      if (!jobs) return cont; 

      for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].aplicaciones && Array.isArray(jobs[i].aplicaciones)) {
          cont += jobs[i].aplicaciones.length;
        }
      }

      return cont;
    };

    const numPuestosCubiertos = () => {
      let cont = 0;

      for(let i = 0; i < jobs.length; i++) {
        if (jobs[i].estado === "Pausada") {
          cont += 1;
        }
      }

      return cont;
    }

    const numOfertasActivas = () => {
      let cont = 0;

      for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].estado === "Activa") {
          cont += 1;
        }
      }

      return cont;
    };



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
          <Link className="link-addjob" to={`/dashboard/${id}/jobForm`}>
            + Nueva oferta de trabajo
          </Link>
        </button>
      </div>

      <div className="statistics-dash">
        <div className="stat-card">
          <p>Ofertas activas</p>
          <p className="active">{numOfertasActivas()}</p>
        </div>
        <div className="stat-card">
          <p>Candidatos totales</p>
          <p className="total">{numCandidatos()}</p>
        </div>
        <div className="stat-card">
          <p>Puestos cubiertos</p>
          <p className="filled">{numPuestosCubiertos()}</p>
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
        </div>
      </div>
    </div>
  );
}
