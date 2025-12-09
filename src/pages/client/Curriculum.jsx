import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import "./Curriculum.css";

export default function Curriculum() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FUNCIÓN DE CONVERSIÓN (Lógica Thumbnail que funciona) ---
  const convertirLinkDrive = (url) => {
    if (!url) return "";
    
    if (url.includes("drive.google.com") && url.includes("/file/d/")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        // Usamos thumbnail HD para garantizar visualización
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    }
    return url;
  };

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const docRef = doc(db, "configuracion", "curriculum");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCvData(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCV();
  }, []);

  if (loading) return <div className="loading-cv">
    <div className="spinner"></div>
    <p>Cargando perfil profesional...</p>
  </div>;

  if (!cvData) {
    return (
      <div className="cv-container">
        <div className="cv-card empty fade-in">
          <h2>Perfil Profesional</h2>
          <p>La información del profesional aún no está disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cv-container fade-in">
      <div className="cv-card">
        <header className="cv-header">
          
          {/* FOTO DE PERFIL CON DISEÑO PROFESIONAL */}
          {cvData.foto && (
            <div className="profile-image-wrapper pop-in">
              <img 
                src={convertirLinkDrive(cvData.foto)} 
                alt="Dra. Victoria Calizaya" 
                className="profile-image"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src="https://placehold.co/150?text=Dra.+Victoria";
                }}
              />
            </div>
          )}

          <div className="header-text slide-up">
            <h1>Dra. Victoria Calizaya</h1>
            <p className="subtitle">Médico Cirujano - Medicina General</p>
            <div className="divider"></div>
          </div>
        </header>

        <div className="cv-body slide-up delay-1">
          <section className="cv-section">
            <h3>
              <span className="icon">👩‍⚕️</span> 
              Perfil Profesional
            </h3>
            <p>{cvData.descripcion || "Sin descripción disponible."}</p>
          </section>

          <section className="cv-section">
            <h3>
              <span className="icon">🏥</span> 
              Experiencia y Logros
            </h3>
            <p>{cvData.experiencia || "Información pendiente de actualizar."}</p>
          </section>
        </div>

        {cvData.enlace && (
          <div className="cv-footer slide-up delay-2">
            <a 
              href={cvData.enlace} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-download-cv"
            >
              📄 Ver Currículum Vitae Completo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}