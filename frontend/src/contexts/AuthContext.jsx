import { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext(null);


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

  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        
        const userType = localStorage.getItem("userType");

        if (!userType) {
          console.log("No hay userType en localStorage");
          setLoading(false);
          return; 
        }

        let endpoint;
        switch (userType) {
          case "candidato":
            endpoint = "http://localhost:5000/api/candidato/me";
            break;
          case "empleadorParticular":
            endpoint = "http://localhost:5000/api/empleadorParticular/me";
            break;
          case "empleadorEmpresa":
            endpoint = "http://localhost:5000/api/empleadorEmpresa/me";
            break;
          default:
            console.warn("Tipo de usuario desconocido:", userType);
            setLoading(false);
            return;
        }

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();

          setCurrentUser({
            ...userData,
            userType, 
          });
        } else {
          console.error("Error al verificar el estado del usuario")
        }
      } catch (err) {
        console.error("Error al verificar estado de autenticación", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        checkTokenExpiration();
      }, 5 * 60 * 1000); 

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  
  const refreshToken = async (userType) => {
    try {
      if (!userType) {
        userType = localStorage.getItem("userType");
        if (!userType) return false;
      }

      console.log("Intentando refresh para:", userType);

      let refreshEndpoint;
      switch (userType) {
        case "candidato":
          refreshEndpoint = "http://localhost:5000/api/candidato/refresh";
          break;
        case "empleadorParticular":
          refreshEndpoint =
            "http://localhost:5000/api/empleadorParticular/refresh";
          break;
        case "empleadorEmpresa":
          refreshEndpoint =
            "http://localhost:5000/api/empleadorEmpresa/refresh";
          break;
        default:
          throw new Error("Tipo de usuario no válido");
      }

      console.log("Usando endpoint de refresh:", refreshEndpoint);

      const response = await fetch(refreshEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Respuesta de refresh:", response.status);

      if (response.ok) {
        const meEndpoint = refreshEndpoint.replace("/refresh", "/me");
        console.log("Obteniendo datos de usuario tras refresh:", meEndpoint);

        const userResponse = await fetch(meEndpoint, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log("Respuesta de /me tras refresh:", userResponse.status);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("Datos de usuario tras refresh:", userData);
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

  const login = async (credentials, userType) => {
    setError(null);
    try {
      let apiEndpoint;

      switch (userType) {
        case "candidato":
          apiEndpoint = "http://localhost:5000/api/candidato/login";
          break;
        case "empleadorParticular":
          apiEndpoint = "http://localhost:5000/api/empleadorParticular/login";
          break;
        case "empleadorEmpresa":
          apiEndpoint = "http://localhost:5000/api/empleadorEmpresa/login";
          break;
        default:
          throw new Error("Tipo de usuario no válido");
      }

      // console.log(
      //   "Intentando login en:",
      //   apiEndpoint,
      //   "con credenciales:",
      //   credentials
      // );

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta del login:", data);

      
      localStorage.setItem("userType", userType);
      console.log("userType guardado en localStorage:", userType);

      
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

      console.log("Usuario establecido:", userData);
      return true;
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message);
      return false;
    }
  };

  
  const logout = async () => {
    try {
      
      const userType = localStorage.getItem("userType");
      let logoutEndpoint = "http://localhost:5000/api/candidato/logout";

      if (userType === "empleadorParticular") {
        logoutEndpoint = "http://localhost:5000/api/empleadorParticular/logout";
      } else if (userType === "empleadorEmpresa") {
        logoutEndpoint = "http://localhost:5000/api/empleadorEmpresa/logout";
      }

      const response = await fetch(logoutEndpoint, {
        method: "POST",
        credentials: "include",
      });

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


  const updateUserData = (userData) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...userData,
    }));
  };


  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.userType === role;
  };

  
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
