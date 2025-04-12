import "../styles/JobsDetails.css";
import { Link } from "react-router-dom";

export default function JobsDetail() {
    return (
      <div className="main-detail">
        <div className="top-section">
          <h2>Job details</h2>
        </div>
        <div className="enterprise-section">
          <div className="left-side">Enterprise</div>
          <div className="right-side">Universidad de Sevilla</div>
        </div>
        <div className="application-section">
          <div className="left-side">Application for</div>
          <div className="right-side">Waiter</div>
        </div>
        <div className="contact-section">
          <div className="left-side">Contact</div>
          <div className="right-side">antonio@gmail.com</div>
        </div>
        <div className="salary-section">
          <div className="left-side">Salary expectation</div>
          <div className="right-side">28.000$</div>
        </div>
        <div className="about-section">
          <div className="left-side">About</div>
          <div className="right-side">
            ljashfkujashfuasf afhaufhasudfhdsau ljjsahfdaklujsbhfausd
          </div>
        </div>
        <div className="attachments-section">
          <div className="left-side">Attachments</div>
          <div className="right-side">
            <button className="apply-button"><Link to="apply" className="link">Apply</Link></button>
          </div>
        </div>
      </div>
    );
}