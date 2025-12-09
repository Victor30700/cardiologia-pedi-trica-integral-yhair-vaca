import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// --- AGREGA ESTA LÍNEA AQUÍ ---
import 'leaflet/dist/leaflet.css'; 
// -----------------------------

// 1. IMPORTAR BrowserRouter
import { BrowserRouter } from 'react-router-dom'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ENVUELVE <App /> EN <BrowserRouter> */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);