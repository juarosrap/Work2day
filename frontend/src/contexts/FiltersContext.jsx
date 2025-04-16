import { createContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
    const { currentUser } = useAuth();
    const [filters, setFilters] = useState({
            ubicacion: "",
            titulo: "",
            salario: 0
    })

    useEffect(() => {
        setFilters({
          ubicacion: "",
          titulo: "",
          salario: 0,
        });
    },[currentUser])

    return (
        <FiltersContext.Provider value={{
            filters,
            setFilters
        }}>
            {children}
        </FiltersContext.Provider>
    )
}