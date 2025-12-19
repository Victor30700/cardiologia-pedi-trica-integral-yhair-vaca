import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./Investigacion.css";

export default function Investigacion() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const q = query(collection(db, "investigacion"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        setArticulos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        // Fallback si falla el ordenamiento
        const querySnapshot = await getDocs(collection(db, "investigacion"));
        setArticulos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, []);

  if (loading) return (
    <div className="loading-blog">
      <div className="spinner"></div>
      <p>Cargando artículos...</p>
    </div>
  );

  return (
    <div className="blog-container fade-in">
      <header className="blog-header slide-up">
        <span className="blog-subtitle">Actualidad Médica</span>
        <h1>🔬 Investigación y Noticias</h1>
        <p>Mantente informado con los últimos avances en cardiología pediátrica y consejos de salud.</p>
        <div className="header-line"></div>
      </header>

      {articulos.length === 0 ? (
        <div className="empty-state slide-up delay-1">
          <div className="empty-icon">📭</div>
          <p>Aún no hay artículos publicados. Vuelve pronto para leer novedades.</p>
        </div>
      ) : (
        <div className="blog-grid slide-up delay-1">
          {articulos.map((articulo) => (
            <article 
              key={articulo.id} 
              className={`blog-card ${expandedId === articulo.id ? 'expanded' : ''}`}
              onClick={() => setExpandedId(expandedId === articulo.id ? null : articulo.id)}
            >
              <div className="card-top-accent"></div>
              <div className="blog-content">
                <div className="meta-info">
                  <span className="blog-date">
                    📅 {articulo.fechaLegible || "Reciente"}
                  </span>
                  <span className="blog-tag">Medicina</span>
                </div>
                
                <h2>{articulo.titulo}</h2>
                
                <div className="content-body">
                  <p>{articulo.contenido}</p>
                </div>
                
                <div className="card-footer">
                  <span className="read-more">
                    {expandedId === articulo.id ? 'Leer menos ↑' : 'Leer publicación completa →'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}