import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Simulación de carga profesional
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 segundo de carga
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="medical-pulse"></div>
        <p>Cargando PerfilMed...</p>
      </div>
    );
  }

  return (
    <div className="home-container fade-in-page">
      {/* SECCIÓN HERO (Principal) */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="title-animate">Dra. Victoria Calizaya</h1>
          <p className="fade-up-delay-1">Especialista en Medicina General y Atención Integral.</p>
          
          <div className="hero-buttons fade-up-delay-2">
            <Link to="/ofertas" className="btn-hero primary">
              📅 Agendar Cita
            </Link>
            <Link to="/ubicacion" className="btn-hero secondary">
              📍 Ver Ubicación
            </Link>
          </div>
        </div>
      </header>

      {/* SECCIÓN DE BIENVENIDA */}
      <section className="welcome-section fade-up-delay-3">
        <h2>Tu salud es nuestra prioridad</h2>
        <p>
          En el consultorio de la Dra. Victoria Calizaya, nos dedicamos a brindar 
          atención médica de calidad con un enfoque humano y personalizado. 
          Contamos con instalaciones modernas y un compromiso total con tu bienestar.
        </p>
      </section>

      {/* SECCIÓN DE SERVICIOS RÁPIDOS */}
      <section className="features-section">
        <div className="feature-card hover-card">
          <div className="icon">🩺</div>
          <h3>Diagnóstico Preciso</h3>
          <p>Evaluación médica completa con tecnología adecuada.</p>
        </div>
        <div className="feature-card hover-card">
          <div className="icon">💊</div>
          <h3>Tratamiento Efectivo</h3>
          <p>Planes de recuperación adaptados a cada paciente.</p>
        </div>
        <div className="feature-card hover-card">
          <div className="icon">📅</div>
          <h3>Agenda Flexible</h3>
          <p>Horarios de atención de Lunes a Sábado.</p>
        </div>
      </section>
    </div>
  );
}