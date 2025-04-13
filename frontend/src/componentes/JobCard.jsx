import "../styles/JobCard.css";
import calendar from "../assets/calendar-icon.svg";
import location from "../assets/location-icon.svg";
import office from "../assets/office-icon.svg";
import { Link } from "react-router-dom";

export default function JobCard({ job }){
  

    return (
      <div className="job-card">
        <div className="job-image"></div>
        <div className="job-content">
          <div className="job-meta">
            {/* <span className="job-date">
              <img className="icon-job" src={calendar} alt="calendario" />
              {job.date}
            </span> */}
            <span className="job-city">
              <img className="icon-job" src={location} alt="calendario" />
              {job.ubicacion}
            </span>
            {/* <span className="job-company">
              <img className="icon-job" src={office} alt="calendario" />
              US
            </span> */}
          </div>
          <h3 className="job-title">{job.titulo}</h3>
          <p className="job-description">{job.descripcion}</p>
          <div className="job-actions">
            <Link to={`jobsDetail/${job.id}`} className="read-more">
              Read more
            </Link>
            <button className="apply-btn">
              <Link to="apply" className="link">
                Apply
              </Link>
            </button>
          </div>
        </div>
      </div>
    );
}