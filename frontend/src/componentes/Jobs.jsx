import { useEffect, useState } from "react";
import "../styles/jobs.css";
import JobCard from "./JobCard.jsx";

export default function Jobs() {
  const [salario, setSalario] = useState(500);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  let API = "http://localhost:5000/api/ofertas";

  async function getJobs(setJobs, setLoading) {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getJobs(setJobs, setLoading);
    console.log(jobs)
  }, []);
  


  const handleSalarioChange = (e) => {
    setSalario(e.target.value);
  };

  return (
    <div className="jobs">
      <div className="jobs-top-section">
        <div className="filters">
          <div className="salary-filter">
            <div className="salary-header">
              <label htmlFor="salario">Salario</label>
              <span className="salary-value">{salario}€</span>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="50"
              value={salario}
              onChange={handleSalarioChange}
              id="salario"
              className="salary-slider"
            />
          </div>

          <label htmlFor="sector">Sector profesional</label>
          <select id="sector" name="sector">
            <option value="tecnologia">Hostelería</option>
            <option value="salud">Doméstico</option>
            <option value="educacion">Otro</option>
          </select>
        </div>

        <div className="title">
          <h1>Search for Jobs</h1>
        </div>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search a job" />
        <input type="text" placeholder="Where" />
        <button className="search-button">Search</button>
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
