// js/menu.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mapeo de la interfaz
    const btnEscaner = document.getElementById('btnEscanerQR');
    const btnGenerar = document.getElementById('btnGenerarQR');
    const btnGestion = document.getElementById('btnGestion');
    const btnInformes = document.getElementById('btnInformes');
    const btnCerrarSesion = document.getElementById('btnCerrarSesionMenu');
    const tvDetalleMenu = document.getElementById('tvDetalleMenu');

    // 2. Recuperar el rol y los datos de la materia
    const rol = localStorage.getItem("rol");
    const nrcClase = localStorage.getItem("nrcActual");
    const nombreClase = localStorage.getItem("nombreClase");

    // Seguridad perimetral
    if (!rol) {
        window.location.href = "index.html";
        return;
    }

    // 3. Control de visibilidad y adaptación de interfaz
    if (rol === "admin") {
        if (btnGenerar) btnGenerar.style.display = "block";
        if (btnGestion) btnGestion.style.display = "block";
        if (btnInformes) btnInformes.style.display = "block";
        if (btnEscaner) btnEscaner.style.display = "none";

        if (nombreClase && nrcClase && tvDetalleMenu) {
            tvDetalleMenu.innerText = `Gestionando: ${nombreClase} (NRC: ${nrcClase})`;
        }

        // CAMBIO VISUAL: Adaptamos el botón de salida para el maestro
        if (btnCerrarSesion) {
            btnCerrarSesion.innerText = "Volver a Mis Clases";
            btnCerrarSesion.classList.replace("text-secondary", "text-primary"); 
            btnCerrarSesion.classList.add("fw-bold");
        }

    } else {
        if (btnEscaner) btnEscaner.style.display = "block";
        if (btnGenerar) btnGenerar.style.display = "none";
        if (btnGestion) btnGestion.style.display = "none";
        if (btnInformes) btnInformes.style.display = "none";
        
        if (tvDetalleMenu) {
            tvDetalleMenu.innerText = "Panel de Estudiante";
        }
    }

    // 4. Lógica de Acción Dividida
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            
            if (rol === "admin") {
                // FLUUJO DEL MAESTRO: Liberar la materia activa y regresar a la lista de clases
                localStorage.removeItem("nrcActual");
                localStorage.removeItem("nombreClase");
                
                window.location.href = "lista_clases.html";
            } else {
                // FLUJO DEL ALUMNO: Destruir la sesión por completo y regresar al login
                localStorage.clear();
                
                alert("Sesión finalizada");
                window.location.replace("index.html");
            }
            
        });
    }
});