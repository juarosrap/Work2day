import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from './contexts/AuthContext.jsx'
import { FiltersProvider } from './contexts/FiltersContext.jsx'

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <FiltersProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FiltersProvider>
  </AuthProvider>
);
