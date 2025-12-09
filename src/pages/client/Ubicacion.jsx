import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import L from "leaflet"; // Importamos Leaflet para el icono personalizado
import "./Ubicacion.css";

// --- CONFIGURACIÓN DEL ICONO ROJO ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Ubicacion() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUbicacion = async () => {
      try {
        const docSnap = await getDoc(doc(db, "configuracion", "ubicacion"));
        if (docSnap.exists()) {
          setPosition(docSnap.data());
        }
      } catch (error) {
        console.error("Error obteniendo ubicación:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUbicacion();
  }, []);

  if (loading) return <div className="loading-map">Cargando mapa...</div>;

  return (
    <div className="ubicacion-container">
      <div className="location-card"> {/* Tarjeta contenedora para diseño pro */}
        <header className="location-header">
          <h1>📍 Nuestra Ubicación</h1>
          <p>Visítanos para recibir la mejor atención. Estamos ubicados en una zona accesible.</p>
        </header>

        {position ? (
          <div className="map-content">
            <div className="map-wrapper">
              <MapContainer 
                center={[position.lat, position.lng]} 
                zoom={16} 
                scrollWheelZoom={false} // Desactivado para no molestar el scroll de la página
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Usamos el icono rojo aquí */}
                <Marker position={[position.lat, position.lng]} icon={redIcon}>
                  <Popup>
                    <strong>Consultorio PerfilMed</strong><br />
                    Dra. Victoria Calizaya<br />
                    ¡Te esperamos aquí!
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            
            <div className="map-footer">
              <p>¿Necesitas indicaciones para llegar?</p>
              <a 
                // Enlace universal de Google Maps
                href={`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-google-maps"
              >
                🗺️ Ver ruta en Google Maps
              </a>
            </div>
          </div>
        ) : (
          <div className="no-map">
            <p>⚠️ La ubicación aún no ha sido registrada por el administrador.</p>
          </div>
        )}
      </div>
    </div>
  );
}