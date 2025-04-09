import "../styles/jobs.css";
import JobCard from "./JobCard.jsx";

export default function Jobs() {
  return (
    <div className="jobs">
      <div className="jobs-top-section">
        <div className="filters">
          <label htmlFor="salario">Salario </label>
          <input type="range" min="0" max="1000" step="50" value="500" />

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
        <JobCard />
        <JobCard />
        <JobCard />
        <JobCard />
        <JobCard />
      </div>
      {/* <div className="pagination"></div> */}
    </div>
  );
}
