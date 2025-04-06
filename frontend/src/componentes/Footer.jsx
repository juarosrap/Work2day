import logo from "../assets/logoWork2Day.png";
import "../styles/Footer.css";
import faceLogo from "../assets/icons8-facebook.svg"
import insLogo from "../assets/icons8-instagram.svg"
import linkLogo from "../assets/icons8-linkedin-circled.svg";
import youtubeLogo from "../assets/icons8-youtube.svg";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="logo">
        <img src={logo} alt="Work2Day Logo" />
      </div>
      <div className="links">
        <a href="#" className="active">
          Home
        </a>
        <a href="#">About us</a>
        <a href="#">Jobs</a>
        <a href="#">Contact</a>
      </div>
      <div className="logos">
        <a>
          <img src={faceLogo} alt="Work2Day Logo" />
        </a>
        <a>
          <img src={insLogo} alt="Work2Day Logo" />
        </a>
        <a>
          <img src={linkLogo} alt="Work2Day Logo" />
        </a>
        <a>
          <img src={youtubeLogo} alt="Work2Day Logo" />
        </a>
      </div>
      <div className="conditions">
        <div className="copyright">
          Copyright ©.2025 <strong>Website</strong>. All rights reserved
        </div>
        <div className="terms">Terms & Conditions | Privay Policy</div>
      </div>
    </footer>
  );
}
