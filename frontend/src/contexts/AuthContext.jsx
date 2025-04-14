// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

// Creamos el contexto
const AuthContext = createContext(null);

// Hook personalizado para facilitar el uso del contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Al cargar el componente, verificamos si hay una sesión activa
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Intenta recuperar el tipo de usuario del localStorage
        const userType = localStorage.getItem("userType");

        if (!userType) {
          setLoading(false);
          return; // No hay información de usuario guardada
        }

        let endpoint;
        switch (userType) {
          case "candidato":
            endpoint = "http://localhost:5000/api/candidatos/me";
            break;
          case "empleadorParticular":
            endpoint = "http://localhost:5000/api/empleadores-particular/me";
            break;
          case "empleadorEmpresa":
            endpoint = "http://localhost:5000/api/empleadores-empresa/me";
            break;
          default:
            throw new Error("Tipo de usuario no válido");
        }

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include", // Importante para enviar cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({
            ...userData,
            userType,
          });
        } else if (response.status === 401) {
          // Token expirado, intentar refresh
          await refreshToken(userType);
        }
      } catch (err) {
        console.error("Error al verificar estado de autenticación", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Función para refresh token basada en el tipo de usuario
  const refreshToken = async (userType) => {
    try {
      // Si no se proporciona un tipo de usuario, intentamos obtenerlo del localStorage
      if (!userType) {
        userType = localStorage.getItem("userType");
        if (!userType) return false;
      }

      let refreshEndpoint;
      switch (userType) {
        case "candidato":
          refreshEndpoint = "http://localhost:5000/api/candidatos/refresh";
          break;
        case "empleadorParticular":
          refreshEndpoint =
            "http://localhost:5000/api/empleadores-particular/refresh";
          break;
        case "empleadorEmpresa":
          refreshEndpoint =
            "http://localhost:5000/api/empleadores-empresa/refresh";
          break;
        default:
          throw new Error("Tipo de usuario no válido");
      }

      const response = await fetch(refreshEndpoint, {
        method: "POST",
        credentials: "include", // Importante para enviar cookies
      });

      if (response.ok) {
        // Después de refrescar el token, obtenemos los datos del usuario
        const meEndpoint = refreshEndpoint.replace("/refresh", "/me");
        const userResponse = await fetch(meEndpoint, {
          method: "GET",
          credentials: "include",
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser({
            ...userData,
            userType,
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error al refrescar token", err);
      return false;
    }
  };

  // Función para iniciar sesión
  const login = async (credentials, userType) => {
    setError(null);
    try {
      let apiEndpoint;

      switch (userType) {
        case "candidato":
          apiEndpoint = "http://localhost:5000/api/candidatos/login";
          break;
        case "empleadorParticular":
          apiEndpoint =
            "http://localhost:5000/api/empleadores-particular/login";
          break;
        case "empleadorEmpresa":
          apiEndpoint = "http://localhost:5000/api/empleadores-empresa/login";
          break;
        default:
          throw new Error("Tipo de usuario no válido");
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante para recibir cookies
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();

      // Guardar el tipo de usuario en localStorage
      localStorage.setItem("userType", userType);

      // Estructura de usuario dependiendo del tipo
      let userData;

      switch (userType) {
        case "candidato":
          userData = data.candidato;
          break;
        case "empleadorParticular":
          userData = data.empleadorParticular;
          break;
        case "empleadorEmpresa":
          userData = data.empleadorEmpresa;
          break;
      }

      setCurrentUser({
        ...userData,
        userType,
      });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Obtener el endpoint correcto según el tipo de usuario
      const userType = localStorage.getItem("userType");
      let logoutEndpoint = "http://localhost:5000/api/candidatos/logout";

      if (userType === "empleadorParticular") {
        logoutEndpoint =
          "http://localhost:5000/api/empleadores-particular/logout";
      } else if (userType === "empleadorEmpresa") {
        logoutEndpoint = "http://localhost:5000/api/empleadores-empresa/logout";
      }

      const response = await fetch(logoutEndpoint, {
        method: "POST",
        credentials: "include",
      });

      // Eliminar el tipo de usuario del localStorage
      localStorage.removeItem("userType");

      if (response.ok) {
        setCurrentUser(null);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cerrar sesión");
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Función para verificar si el token está por expirar y refrescarlo si es necesario
  const checkTokenExpiration = async () => {
    // Este método podría llamarse periódicamente para mantener la sesión activa
    // o antes de realizar operaciones importantes
    const userType = localStorage.getItem("userType");
    if (!userType || !currentUser) return false;

    try {
      return await refreshToken(userType);
    } catch (err) {
      console.error("Error al verificar expiración del token", err);
      return false;
    }
  };

  // Función para actualizar datos del usuario
  const updateUserData = (userData) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...userData,
    }));
  };

  // Función para determinar si el usuario actual tiene cierto rol o tipo
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.userType === role;
  };

  // Valor del contexto
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    refreshToken,
    updateUserData,
    checkTokenExpiration,
    hasRole,
    isAuthenticated: !!currentUser,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
