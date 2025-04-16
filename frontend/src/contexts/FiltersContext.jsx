import { createContext, useState } from "react";

export const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
    const [filters, setFilters] = useState({
            ubicacion: "",
            titulo: "",
            salario: 0
    })

    return (
        <FiltersContext.Provider value={{
            filters,
            setFilters
        }}>
            {children}
        </FiltersContext.Provider>
    )
}