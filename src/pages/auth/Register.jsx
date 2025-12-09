import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "./Login.css"; // Reutilizamos los mismos estilos

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Crear usuario en Auth
      const credencialUsuario = await signup(email, password);
      const user = credencialUsuario.user;

      // 2. Guardar datos en Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        nombre: nombre,
        telefono: telefono,
        rol: "cliente",
        creadoEn: new Date()
      });

      // Alerta de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta Creada!',
        text: 'Te has registrado correctamente. Bienvenido a PerfilMed.',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#28a745'
      }).then(() => {
        navigate("/");
      });

    } catch (err) {
      console.error(err);
      let msg = "No se pudo crear la cuenta.";
      if (err.code === "auth/email-already-in-use") msg = "Este correo ya está registrado.";
      else if (err.code === "auth/weak-password") msg = "La contraseña es muy débil (mínimo 6 caracteres).";

      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: msg,
        confirmButtonColor: '#007bff'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Crear Cuenta</h2>
        <span className="subtitle">Regístrate para agendar tus citas médicas</span>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Teléfono / Celular</label>
            <input 
              type="tel" 
              placeholder="Ej. 70123456"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Crea una contraseña segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner"></div> : "Registrarse"}
          </button>
        </form>

        <p className="toggle-text">
          ¿Ya tienes cuenta?
          <Link to="/login" className="btn-link">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}