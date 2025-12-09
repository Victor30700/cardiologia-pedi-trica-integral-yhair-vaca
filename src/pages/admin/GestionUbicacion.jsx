import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import L from "leaflet"; // Importamos Leaflet para el icono
import Swal from "sweetalert2"; // Usamos SweetAlert para mensajes bonitos
import "./GestionUbicacion.css";

// --- CONFIGURACIÓN DEL ICONO ROJO ---
// Usamos imágenes alojadas en un repositorio público estable de Leaflet
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- COMPONENTES AUXILIARES ---

// 1. Detectar clics en el mapa para mover el marcador manualmente
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={redIcon}>
      <Popup>¡Aquí está el consultorio!</Popup>
    </Marker>
  );
}

// 2. Mover la cámara del mapa cuando cambia la posición (Importante para la búsqueda por link)
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16); // Hace una animación suave hacia la nueva ubicación
    }
  }, [center, map]);
  return null;
}

// --- COMPONENTE PRINCIPAL ---

export default function GestionUbicacion() {
  const defaultCenter = [-21.5355, -64.7296]; // Tarija, Bolivia
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleUrl, setGoogleUrl] = useState(""); // Estado para el input del enlace

  // Cargar ubicación guardada al iniciar
  useEffect(() => {
    const fetchUbicacion = async () => {
      try {
        const docRef = doc(db, "configuracion", "ubicacion");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPosition({ lat: data.lat, lng: data.lng });
        }
      } catch (error) {
        console.error("Error cargando ubicación:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUbicacion();
  }, []);

  // Función mágica: Extraer coordenadas de un enlace de Google Maps
  const buscarDesdeGoogle = () => {
    if (!googleUrl) return Swal.fire('Error', 'Pega un enlace primero', 'warning');

    // Expresión regular para buscar patrones como @-21.53,-64.72 en la URL
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = googleUrl.match(regex);

    if (match && match.length >= 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      setPosition({ lat, lng }); // Actualiza el estado, lo que dispara MapUpdater
      Swal.fire({
        icon: 'success',
        title: 'Ubicación encontrada',
        text: `Coordenadas detectadas: ${lat}, ${lng}`,
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Enlace no válido',
        text: 'Asegúrate de copiar el enlace completo de la barra de direcciones del navegador (debe contener las coordenadas @lat,lng).'
      });
    }
  };

  // Guardar en Firebase
  const guardarUbicacion = async () => {
    if (!position) return Swal.fire('Atención', 'Selecciona una ubicación en el mapa primero.', 'warning');
    
    try {
      await setDoc(doc(db, "configuracion", "ubicacion"), {
        lat: position.lat,
        lng: position.lng
      });
      Swal.fire('¡Guardado!', 'La ubicación de la oficina ha sido actualizada.', 'success');
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire('Error', 'No se pudo guardar la ubicación.', 'error');
    }
  };

  if (loading) return <div className="loading-admin">Cargando mapa...</div>;

  return (
    <div className="map-admin-container">
      <h1>📍 Gestión de Ubicación</h1>
      <p>Define dónde se encuentra tu consultorio para que los pacientes te encuentren.</p>
      
      {/* SECCIÓN DE BÚSQUEDA POR GOOGLE MAPS */}
      <div className="search-box-card">
        <h3>🔗 Importar desde Google Maps</h3>
        <p>Copia el enlace de la barra de direcciones de Google Maps y pégalo aquí:</p>
        <div className="search-input-group">
          <input 
            type="text" 
            placeholder="Ej: https://www.google.com/maps/place/...@ -21.535,-64.729..." 
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
          />
          <button onClick={buscarDesdeGoogle} className="btn-search">Buscar</button>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer center={position || defaultCenter} zoom={15} scrollWheelZoom={true} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* El marcador rojo */}
          <LocationMarker position={position} setPosition={setPosition} />
          {/* Componente invisible que actualiza la vista al buscar */}
          <MapUpdater center={position} />
        </MapContainer>
      </div>

      <div className="coords-info">
        {position ? (
          <p>📍 Coordenadas seleccionadas: <strong>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</strong></p>
        ) : (
          <p>Haz clic en el mapa para marcar la ubicación.</p>
        )}
        <button onClick={guardarUbicacion} className="btn-save-map">Guardar Ubicación Definitiva</button>
      </div>
    </div>
  );
}