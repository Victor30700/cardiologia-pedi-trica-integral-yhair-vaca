import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/config";
import { collection, query, where, getCountFromServer, getDocs, limit } from "firebase/firestore";
import "./Admin.css"; 

export default function AdminDashboard() {
  const [stats, setStats] = useState({ citasPendientes: 0, totalServicios: 0 });
  const [citasRecientes, setCitasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Contar Citas Pendientes
    const qCitas = query(collection(db, "citas"), where("estado", "==", "pendiente"));
    const snapCitas = await getCountFromServer(qCitas);
    
    // 2. Contar Servicios
    const qServicios = collection(db, "servicios");
    const snapServicios = await getCountFromServer(qServicios);
    
    // 3. Obtener Citas Recientes (5) para el resumen
    const qRecientes = query(collection(db, "citas"), limit(5));
    const citasSnap = await getDocs(qRecientes);
    const recientes = citasSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
    setStats({
      citasPendientes: snapCitas.data().count,
      totalServicios: snapServicios.data().count,
    });
    setCitasRecientes(recientes);
    setLoading(false);
  };

  const getEstadoClass = (estado) => {
    if (estado === 'confirmada') return 'status-confirmada';
    if (estado === 'cancelada') return 'status-cancelada';
    return 'status-pendiente';
  };

  if (loading) return <div className="loading-admin">Cargando Dashboard...</div>;

  return (
    <div className="admin-container">
      <h1>Panel de Administración 🧑‍💻</h1>
      <p>Bienvenido, Administrador. Gestiona tu perfil médico.</p>

      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.citasPendientes}</h2>
          <p>Citas Pendientes</p>
          <Link to="/admin/citas">Ver Citas</Link>
        </div>
        <div className="stat-card">
          <h2>{stats.totalServicios}</h2>
          <p>Servicios Registrados</p>
          <Link to="/admin/servicios">Gestionar Servicios</Link>
        </div>
        <div className="stat-card">
          <h2>Ubicación</h2>
          <p>Mapa de la Oficina</p>
          <Link to="/admin/ubicacion">Actualizar Ubicación</Link>
        </div>
        <div className="stat-card">
          <h2>Blog</h2>
          <p>Artículos de Investigación</p>
          <Link to="/admin/investigacion">Gestionar Blog</Link>
        </div>
        {/* <--- NUEVA TARJETA DE ACCESO RÁPIDO --- */}
        <div className="stat-card">
          <h2>CV</h2>
          <p>Perfil Profesional</p>
          <Link to="/admin/curriculum">Gestionar Currículum</Link>
        </div>
        {/* -------------------------------------- */}
      </div>
      
      {/* Citas Recientes */}
      <section className="citas-recientes-section">
        <h2>Últimas Citas Registradas</h2>
        {citasRecientes.length === 0 ? (
          <p>No hay citas recientes.</p>
        ) : (
          <>
            <div className="citas-list-dashboard">
              {citasRecientes.map(cita => (
                <div key={cita.id} className="cita-reciente-item">
                  <p><strong>{cita.servicio}</strong></p>
                  <p>{cita.fecha} | {cita.hora}</p>
                  <span className={`cita-status ${getEstadoClass(cita.estado)}`}>{cita.estado.toUpperCase()}</span>
                  <p className="cita-email">{cita.userEmail}</p>
                </div>
              ))}
            </div>
            <Link to="/admin/citas" className="btn-ver-mas">Ver todas las citas →</Link>
          </>
        )}
      </section>
    </div>
  );
}