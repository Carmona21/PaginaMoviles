// js/menu.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mapeo de la interfaz de usuario (Equivalente a findViewById)
    const btnEscaner = document.getElementById('btnEscanerQR');
    const btnGenerar = document.getElementById('btnGenerarQR');
    const btnGestion = document.getElementById('btnGestion');
    const btnInformes = document.getElementById('btnInformes');
    const btnCerrarSesion = document.getElementById('btnCerrarSesionMenu');
    const tvDetalleMenu = document.getElementById('tvDetalleMenu');

    // 2. Recuperar el rol y los datos contextuales (Equivalente a getIntent().getStringExtra)
    const rol = localStorage.getItem("rol");
    const nrcClase = localStorage.getItem("nrcActual");
    const nombreClase = localStorage.getItem("nombreClase");

    // Seguridad: Si no hay un rol activo, redirigir de inmediato al Login
    if (!rol) {
        window.location.href = "index.html";
        return;
    }

    // 3. Control de visibilidad por roles (Idéntico a la lógica de pantallaMenu.java)
    if (rol === "admin") {
        // El profesor tiene todo el menú visible, excepto el escáner de cámara
        if (btnGenerar) btnGenerar.style.display = "block";
        if (btnGestion) btnGestion.style.display = "block";
        if (btnInformes) btnInformes.style.display = "block";
        if (btnEscaner) btnEscaner.style.display = "none";

        // Mostrar opcionalmente la materia activa en la cabecera
        if (nombreClase && nrcClase && tvDetalleMenu) {
            tvDetalleMenu.innerText = `Gestionando: ${nombreClase} (NRC: ${nrcClase})`;
        }
    } else {
        // El alumno va directo al menú simplificado donde solo visualiza "Escanear QR"
        if (btnEscaner) btnEscaner.style.display = "block";
        if (btnGenerar) btnGenerar.style.display = "none";
        if (btnGestion) btnGestion.style.display = "none";
        if (btnInformes) btnInformes.style.display = "none";
        
        if (tvDetalleMenu) {
            tvDetalleMenu.innerText = "Panel de Estudiante";
        }
    }

    // 4. Lógica de Cierre de Sesión (Equivalente a getSharedPreferences().edit().clear().apply())
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            // Limpieza completa del almacenamiento local
            localStorage.clear();
            
            alert("Sesión finalizada");
            
            // Redirección forzando la ruptura del historial de navegación (Equivalente a FLAG_ACTIVITY_CLEAR_TASK)
            window.location.replace("index.html");
        });
    }
});