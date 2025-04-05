import logo from "../assets/logoWork2Day.png";
import "../styles/Footer.css";

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
    </footer>
  );
}
