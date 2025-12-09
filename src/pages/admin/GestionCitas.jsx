import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, query, updateDoc, doc, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "../admin/Admin.css"; 

export default function GestionCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    setLoading(true);
    
    // Consulta ordenada por fecha
    const q = query(collection(db, "citas"), orderBy("creadoEn", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCitas = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setCitas(fetchedCitas);
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar citas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cambiarEstadoCita = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "citas", id), {
        estado: nuevoEstado
      });
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      
      Toast.fire({
        icon: 'success',
        title: `Cita marcada como ${nuevoEstado}`
      });

    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la cita' });
    }
  };

  // NUEVA FUNCIÓN: Eliminar Cita
  const eliminarCita = async (id, servicio) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¡Se eliminará permanentemente la cita de "${servicio}"!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "citas", id));
            
            Swal.fire({
                icon: 'success',
                title: '¡Eliminada!',
                text: `La cita ha sido eliminada del sistema.`,
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error al eliminar cita:", error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la cita.' });
        }
    }
  };

  const getEstadoClass = (estado) => {
    if (estado === 'confirmada') return 'status-confirmada';
    if (estado === 'cancelada') return 'status-cancelada';
    return 'status-pendiente';
  };

  if (loading) return <div className="loading-admin">Cargando panel de citas...</div>;

  return (
    <div className="admin-container">
      <h1>📅 Gestión de Citas Agendadas</h1>
      <p>Administra las reservas de tus pacientes en tiempo real.</p>

      {citas.length === 0 ? (
        <p>No hay citas agendadas por el momento.</p>
      ) : (
        <div className="admin-table-wrapper">
          <div className="citas-list">
            {citas.map((cita) => (
              <div key={cita.id} className="cita-item">
                <div>
                  <span className={`cita-status ${getEstadoClass(cita.estado)}`}>{cita.estado.toUpperCase()}</span>
                  <h3>Servicio: {cita.servicio}</h3>
                  <p>Paciente: <strong>{cita.userEmail}</strong></p>
                  <p>Fecha/Hora: <strong>{cita.fecha}</strong> a las <strong>{cita.hora}</strong></p>
                </div>
                
                <div className="cita-actions">
                  {cita.estado !== 'confirmada' && (
                    <button onClick={() => cambiarEstadoCita(cita.id, 'confirmada')} className="btn-confirmar">Confirmar</button>
                  )}
                  {cita.estado !== 'cancelada' && (
                    <button onClick={() => cambiarEstadoCita(cita.id, 'cancelada')} className="btn-cancelar">Cancelar</button>
                  )}
                  {/* BOTÓN DE ELIMINAR */}
                  <button onClick={() => eliminarCita(cita.id, cita.servicio)} className="btn-eliminar">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}