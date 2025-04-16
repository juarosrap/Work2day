import { useContext, useEffect, useState } from "react";
import "../styles/jobs.css";
import JobCard from "./JobCard.jsx";
import { FiltersContext } from "../contexts/FiltersContext.jsx";
export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filters, setFilters } = useContext(FiltersContext);

  let API = "http://localhost:5000/api/busqueda/ofertas";

  useEffect(() => {
    const fetchJobsWithFilters = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (filters.titulo) params.append("titulo", filters.titulo);
        if (filters.ubicacion) params.append("ubicacion", filters.ubicacion);
        

        const response = await fetch(`${API}?${params.toString()}`,
              {
                credentials: "include"
              });
        const data = await response.json();
        setJobs(data);
        
      } catch (error) {
        console.error("Error al obtener trabajos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsWithFilters();
  }, [filters]);

  const handleSalarioChange = (e) => {
    const value = Number(e.target.value);
    setFilters((prev) => ({ ...prev, salario: value }));
  };

  
  const handleTituloChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, titulo: value }));
  };

  
  const handleUbicacionChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, ubicacion: value }));
  };

  
  const handleSectorChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, sector: value }));
  };

  // Función para manejar la búsqueda explícita con el botón
  const handleSearch = () => {
    // Puedes implementar una lógica adicional si es necesario
    // Por ahora, el useEffect ya se encarga de actualizar los trabajos
    // cuando cambian los filtros
  };

  return (
    <div className="jobs">
      <div className="jobs-top-section">
        <div className="filters">
          <div className="salary-filter">
            <div className="salary-header">
              <label htmlFor="salario">Salario</label>
              <span className="salary-value">{filters.salario}€</span>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="50"
              value={filters.salario}
              onChange={handleSalarioChange}
              id="salario"
              className="salary-slider"
            />
          </div>

          <label htmlFor="sector">Sector profesional</label>
          <select
            id="sector"
            name="sector"
            value={filters.sector || ""}
            onChange={handleSectorChange}
          >
            <option value="">Todos los sectores</option>
            <option value="hosteleria">Hostelería</option>
            <option value="domestico">Doméstico</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="title">
          <h1>Search for Jobs</h1>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          value={filters.titulo}
          onChange={handleTituloChange}
          placeholder="Search a job"
        />
        <input
          type="text"
          value={filters.ubicacion}
          onChange={handleUbicacionChange}
          placeholder="Where"
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="cards">
        {loading ? (
          <p>Cargando trabajos...</p>
        ) : jobs.length === 0 ? (
          <p>No se encontraron trabajos.</p>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
      <div className="pagination"></div>
    </div>
  );
}
