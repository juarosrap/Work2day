import { useState } from "react";
import "../styles/Header.css";
import logo from "../assets/logoWork2Day.png";
import {Link, NavLink} from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Work2Day Logo" />
      </div>

      <div className="menu-icon" onClick={toggleMenu}>
        <div className={`menu-line ${menuOpen ? "open" : ""}`}></div>
        <div className={`menu-line ${menuOpen ? "open" : ""}`}></div>
        <div className={`menu-line ${menuOpen ? "open" : ""}`}></div>
      </div>

      <div className={`right-section ${menuOpen ? "open" : ""}`}>
        <nav className="nav">
          <NavLink
            className={({ isActive }) => {
              return isActive ? "is-active" : undefined;
            }}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            // className={({ isActive }) => {
            //   return isActive ? "is-active" : undefined;
            // }}
            to="/"
          >
            About us
          </NavLink>
          <NavLink
            className={({ isActive }) => {
              return isActive ? "is-active" : undefined;
            }}
            to="/jobs"
          >
            Jobs
          </NavLink>
          <NavLink
            className={({ isActive }) => {
              return isActive ? "is-active" : undefined;
            }}
            to="/contact"
          >
            Contact
          </NavLink>
          <div className="nav-buttons">
            <button className="btn-outline">
              <Link to="form">Sign up</Link>
            </button>
            <button className="btn-primary">
              <Link to="loginForm" className="link">
                Sign in
              </Link>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
