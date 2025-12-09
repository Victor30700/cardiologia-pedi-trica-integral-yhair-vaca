import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register"; 

// Importaciones de Cliente
import Home from "./pages/client/Home";
import Ubicacion from "./pages/client/Ubicacion"; 
import Ofertas from "./pages/client/Ofertas"; 
import Investigacion from "./pages/client/Investigacion";
import Curriculum from "./pages/client/Curriculum"; // <--- NUEVO IMPORT

// Importaciones de Admin
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import GestionServicios from "./pages/admin/GestionServicios"; 
import GestionUbicacion from "./pages/admin/GestionUbicacion"; 
import GestionCitas from "./pages/admin/GestionCitas"; 
import GestionInvestigacion from "./pages/admin/GestionInvestigacion";
import GestionCurriculum from "./pages/admin/GestionCurriculum";

// ... (RutaProtegidaAdmin y RutaPrivada SIN CAMBIOS) ...
const RutaProtegidaAdmin = ({ children }) => {
  const { user, rol, loading } = useAuth();
  if (loading) return <div style={{padding:50, textAlign:'center'}}>Cargando sistema...</div>;
  if (!user || rol !== 'admin') return <Navigate to="/" />;
  return children;
};

const RutaPrivada = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding:50, textAlign:'center'}}>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* RUTAS CLIENTE */}
            <Route path="/" element={<Home />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
            <Route path="/ofertas" element={<RutaPrivada><Ofertas /></RutaPrivada>} />
            <Route path="/investigacion" element={<Investigacion />} />
            <Route path="/sobre-mi" element={<Curriculum />} /> {/* <--- NUEVA RUTA CLIENTE */}

            {/* RUTAS ADMIN */}
            <Route path="/admin" element={<RutaProtegidaAdmin><AdminDashboard /></RutaProtegidaAdmin>} />
            <Route path="/admin/servicios" element={<RutaProtegidaAdmin><GestionServicios /></RutaProtegidaAdmin>} />
            <Route path="/admin/ubicacion" element={<RutaProtegidaAdmin><GestionUbicacion /></RutaProtegidaAdmin>} />
            <Route path="/admin/citas" element={<RutaProtegidaAdmin><GestionCitas /></RutaProtegidaAdmin>} />
            <Route path="/admin/investigacion" element={<RutaProtegidaAdmin><GestionInvestigacion /></RutaProtegidaAdmin>} />
            <Route path="/admin/curriculum" element={<RutaProtegidaAdmin><GestionCurriculum /></RutaProtegidaAdmin>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;