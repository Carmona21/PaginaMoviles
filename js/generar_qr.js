// js/generar_qr.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Recuperar contexto de la clase desde el almacenamiento local
    const nrcActual = localStorage.getItem("nrcActual");
    const nombreClase = localStorage.getItem("nombreClase");
    const rol = localStorage.getItem("rol");

    // Seguridad: Proteger la ruta, asegurando que solo maestros con una clase seleccionada entren
    if (rol !== "admin" || !nrcActual) {
        alert("Acceso denegado o clase no seleccionada.");
        window.location.href = "menu.html";
        return;
    }

    // 2. Obtener fecha actual garantizando el formato local YYYY-MM-DD
    const fechaHoy = new Date().toLocaleDateString('en-CA');

    // 3. Renderizar los textos en la pantalla
    document.getElementById("tvFechaQR").innerText = `Fecha válida: ${fechaHoy}`;
    
    const tvClaseInfo = document.getElementById("tvClaseInfo");
    if (tvClaseInfo) {
        tvClaseInfo.innerText = `${nombreClase} (NRC: ${nrcActual})`;
    }

    // 4. Formato estricto para la llave primaria: "NRC;YYYY-MM-DD"
    // Este string es el que el escáner del alumno va a desarmar (split) por el punto y coma
    const contenidoQR = `${nrcActual};${fechaHoy}`;

    // 5. Inyectar la URL de la API con el contenido formateado dinámicamente
    const imgQr = document.getElementById("imgCodigoQR");
    if (imgQr) {
        imgQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(contenidoQR)}`;
    }
});