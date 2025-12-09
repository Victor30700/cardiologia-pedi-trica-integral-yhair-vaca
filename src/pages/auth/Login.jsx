import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2"; // Importar SweetAlert2
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de carga
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Activar carga

    try {
      await login(email, password);
      
      // Alerta de éxito suave
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      
      Toast.fire({
        icon: 'success',
        title: '¡Bienvenido de nuevo!'
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      let mensajeError = "Ocurrió un error al intentar ingresar.";
      
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        mensajeError = "Correo electrónico o contraseña incorrectos.";
      } else if (err.code === "auth/too-many-requests") {
        mensajeError = "Demasiados intentos fallidos. Intenta más tarde.";
      }

      // Alerta de error modal
      Swal.fire({
        icon: 'error',
        title: 'Error de acceso',
        text: mensajeError,
        confirmButtonColor: '#007bff'
      });
    } finally {
      setIsSubmitting(false); // Desactivar carga
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <span className="subtitle">Accede a tu historial médico y citas</span>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner"></div> : "Ingresar al Sistema"}
          </button>
        </form>

        <p className="toggle-text">
          ¿Aún no tienes cuenta?
          <Link to="/register" className="btn-link">Regístrate como paciente</Link>
        </p>
      </div>
    </div>
  );
}