import { useState, useEffect } from "react";
import "../styles/Header.css";
import logo from "../assets/logoWork2Day.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cerrar el menú cuando cambie la ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Cierra el menú cuando se hace clic en un enlace
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Work2Day Logo" />
        <NavLink to="/">
          <h3>Work2Day</h3>
        </NavLink>
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
            onClick={handleLinkClick}
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => {
              return isActive ? "is-active" : undefined;
            }}
            to="/about-us"
            onClick={handleLinkClick}
          >
            About us
          </NavLink>
          <NavLink
            className={({ isActive }) => {
              return isActive ? "is-active" : undefined;
            }}
            to="/jobs"
            onClick={handleLinkClick}
          >
            Jobs
          </NavLink>

          {isAuthenticated ? (
            <div className="nav-buttons">
              <div className="user-info">
                {(currentUser.userType === "empleadorParticular" ||
                  currentUser.userType === "empleadorEmpresa") && (
                  <>
                    <NavLink
                      to={`dashboard/${currentUser.id}`}
                      className={({ isActive }) => {
                        return isActive ? "is-active" : undefined;
                      }}
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to={`profile/${currentUser.id}`}
                      className="btn-outline"
                      onClick={handleLinkClick}
                    >
                      Mi Perfil
                    </NavLink>
                  </>
                )}
                <span className="welcome"> Hola, {currentUser.nombre}</span>
              </div>
              {currentUser.userType === "candidato" && (
                <NavLink
                  to={`profile/${currentUser.id}`}
                  className="btn-outline"
                  onClick={handleLinkClick}
                >
                  Mi Perfil
                </NavLink>
              )}

              <button onClick={handleLogout} className="btn-primary">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="nav-buttons">
              <button className="btn-outline" onClick={handleLinkClick}>
                <Link to="form">Sign up</Link>
              </button>
              <button className="btn-primary" onClick={handleLinkClick}>
                <Link to="loginForm" className="link">
                  Sign in
                </Link>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
