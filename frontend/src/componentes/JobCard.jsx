import "../styles/JobCard.css";
import calendar from "../assets/calendar-icon.svg";
import location from "../assets/location-icon.svg";
import office from "../assets/office-icon.svg";
import { Link } from "react-router-dom";

export default function JobCard(){
    return (
      <div className="job-card">
        <div className="job-image"></div>
        <div className="job-content">
          <div className="job-meta">
            <span className="job-date">
              <img className="icon" src={calendar} alt="calendario" />
              10/03/2025
            </span>
            <span className="job-city">
              <img className="icon" src={location} alt="calendario" />
              Sevilla
            </span>
            <span className="job-company">
              <img className="icon" src={office} alt="calendario" />
              US
            </span>
          </div>
          <h3 className="job-title">Camarero</h3>
          <p className="job-description">
            Se busca camarero a media jornada en el restaurante el parlanchin.
          </p>
          <div className="job-actions">
            <Link to="jobsDetail" className="read-more">
              Read more
            </Link>
            <button className="apply-btn">Apply</button>
          </div>
        </div>
      </div>
    );
}