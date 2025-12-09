import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  onSnapshot, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Ofertas.css";

export default function Ofertas() {
  const [servicios, setServicios] = useState([]);
  const [horario, setHorario] = useState(null);
  const [cita, setCita] = useState({ fecha: "", hora: "", servicioId: "", servicioNombre: "" });
  const [loading, setLoading] = useState(true);
  
  // Estado para guardar las citas del usuario
  const [misCitas, setMisCitas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formRef = useRef(null); // Referencia para scroll automático al formulario
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Cargar Servicios y Horario (Solo se ejecuta una vez)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const servData = await getDocs(collection(db, "servicios"));
        setServicios(servData.docs.map(d => ({ ...d.data(), id: d.id })));
        
        const configSnap = await getDoc(doc(db, "configuracion", "horarioGeneral"));
        if(configSnap.exists()) setHorario(configSnap.data());
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // 2. ESCUCHAR CITAS DEL USUARIO EN TIEMPO REAL
  useEffect(() => {
    if (!user) return;

    // IMPORTANTE: Si la consola muestra un error de "requires an index", 
    // debes hacer clic en el enlace que aparece allí para crearlo en Firebase.
    const q = query(
      collection(db, "citas"), 
      where("userId", "==", user.uid),
      orderBy("creadoEn", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const citasData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMisCitas(citasData);
    }, (error) => {
      console.error("⚠️ Error obteniendo citas (Posible falta de índice):", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Función auxiliar para seleccionar servicio y hacer scroll
  const seleccionarServicio = (servicio) => {
    setCita({ ...cita, servicioId: servicio.id, servicioNombre: servicio.nombre });
    // Scroll suave hacia el formulario
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Manejar Reserva
  const reservarCita = async (e) => {
    e.preventDefault();

    if (!user) {
      return Swal.fire({
        icon: 'warning', 
        title: 'Inicia sesión', 
        text: 'Debes estar registrado para agendar.',
        confirmButtonColor: '#007bff'
      }).then(() => navigate("/login"));
    }

    if (!cita.fecha || !cita.hora || !cita.servicioId) {
      return Swal.fire({ 
        icon: 'warning', 
        title: 'Faltan datos', 
        text: 'Selecciona fecha y hora.',
        confirmButtonColor: '#ffc107'
      });
    }

    if (horario) {
      if (cita.hora < horario.entrada || cita.hora > horario.salida) {
        return Swal.fire({ 
          icon: 'error', 
          title: 'Horario no disponible', 
          text: `Atención de ${horario.entrada} a ${horario.salida}.`,
          confirmButtonColor: '#dc3545'
        });
      }
    }

    const result = await Swal.fire({
      title: '¿Confirmar reserva?',
      html: `
        <div style="text-align:left; font-size: 1.1rem">
          <p><strong>Servicio:</strong> ${cita.servicioNombre}</p>
          <p><strong>Fecha:</strong> ${cita.fecha}</p>
          <p><strong>Hora:</strong> ${cita.hora}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, agendar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "citas"), {
        userId: user.uid,
        userEmail: user.email,
        servicio: cita.servicioNombre,
        fecha: cita.fecha,
        hora: cita.hora,
        estado: "pendiente",
        creadoEn: serverTimestamp() 
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Cita Enviada!',
        text: 'Tu solicitud ha sido enviada y está pendiente de aprobación.',
        timer: 3000,
        showConfirmButton: false
      });

      // Limpiar formulario
      setCita({ fecha: "", hora: "", servicioId: "", servicioNombre: "" }); 

    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la cita.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Etiquetas y colores para el estado
  const getStatusLabel = (estado) => {
    if (estado === 'confirmada') return 'Confirmada';
    if (estado === 'cancelada') return 'Cancelada';
    return 'Pendiente';
  };

  const getStatusIcon = (estado) => {
    if (estado === 'confirmada') return '✅';
    if (estado === 'cancelada') return '❌';
    return '⏳';
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando servicios...</p>
    </div>
  );

  return (
    <div className="ofertas-container fade-in">
      <header className="ofertas-header slide-up">
        <h1>Oferta de Servicios Médicos</h1>
        <p>Selecciona un servicio y agenda tu cita.</p>
      </header>

      {/* Punto de anclaje para el scroll */}
      <div ref={formRef}></div>

      {/* FORMULARIO FLOTANTE (ESTILO NUEVO) */}
      {cita.servicioId && (
        <div className="reserva-wrapper pop-in">
          <div className="reserva-card">
            <div className="reserva-header">
              <h3>Reservando: <span className="reserva-servicio">{cita.servicioNombre}</span></h3>
            </div>
            
            <form onSubmit={reservarCita} className="reserva-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha:</label>
                  <input 
                    type="date" 
                    required 
                    min={new Date().toISOString().split('T')[0]} 
                    value={cita.fecha} 
                    onChange={e => setCita({...cita, fecha: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Hora:</label>
                  <input 
                    type="time" 
                    required 
                    value={cita.hora} 
                    onChange={e => setCita({...cita, hora: e.target.value})} 
                  />
                </div>
              </div>

              <div className="botones-reserva">
                <button type="button" onClick={() => setCita({ fecha: "", hora: "", servicioId: "", servicioNombre: "" })} className="btn-cancelar" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirmar" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Confirmar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE SERVICIOS */}
      <div className="servicios-grid">
        {servicios.map((servicio, index) => (
          <div key={servicio.id} className="card-servicio slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="card-icon">🩺</div>
            <h3>{servicio.nombre}</h3>
            
            <div className="card-details">
              <span className="precio-tag">{servicio.precio} Bs</span>
              <span className="duracion-tag">⏱ {servicio.duracion} min</span>
            </div>

            <button 
              className="btn-agendar"
              onClick={() => seleccionarServicio(servicio)}
              disabled={isSubmitting}
            >
              Agendar Cita
            </button>
          </div>
        ))}
      </div>

      {/* --- LISTA DE CITAS DEL USUARIO --- */}
      {user && (
        <div className="mis-citas-section slide-up delay-2">
          <div className="section-header">
            <h2>📋 Estado de mis Citas</h2>
            <div className="divider"></div>
          </div>

          {misCitas.length === 0 ? (
            <div className="no-citas">
              <p>No has registrado ninguna cita todavía.</p>
              <small>Tus reservas pendientes y confirmadas aparecerán aquí.</small>
            </div>
          ) : (
            <div className="citas-user-grid">
              {misCitas.map(c => (
                <div key={c.id} className={`cita-user-card status-${c.estado}`}>
                  <div className="cita-top">
                    <span className="cita-fecha">📅 {c.fecha}</span>
                    <span className={`badge badge-${c.estado}`}>
                      {getStatusIcon(c.estado)} {getStatusLabel(c.estado)}
                    </span>
                  </div>

                  <h4 className="cita-servicio-name">{c.servicio}</h4>
                  <p className="cita-hora">⏰ Hora: <strong>{c.hora}</strong></p>
                  
                  {c.estado === 'pendiente' && (
                    <div className="footer-pendiente">
                      <small>Esperando confirmación del doctor...</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}