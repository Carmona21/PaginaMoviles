// js/pantalla_qr.js
import { db } from "./firebase-config.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");
    const matriculaAlumno = localStorage.getItem("matricula");
    const nombreAlumno = localStorage.getItem("nombre");

    // 1. Protección de ruta: Solo los alumnos pueden escanear
    if (rol === "admin") {
        alert("Los profesores no pueden registrar asistencia mediante escáner.");
        window.location.href = "menu.html";
        return;
    }

    if (!matriculaAlumno || !nombreAlumno) {
        alert("Error de sesión. Por favor, inicia sesión nuevamente.");
        window.location.href = "index.html";
        return;
    }

    // 2. Inicialización del Escáner
    // Apuntamos al div con id "lector-qr"
    const lectorQR = new Html5QrcodeScanner(
        "lector-qr", 
        { 
            fps: 10, // Cuadros por segundo a analizar
            qrbox: { width: 250, height: 250 }, // Cuadro delimitador visual
            rememberLastUsedCamera: true // Recuerda si el alumno usó la cámara frontal o trasera
        }, 
        false
    );

    // 3. Lógica al detectar un código QR exitosamente
    lectorQR.render(async (textoQR) => {
        
        // ¡IMPORTANTE! Pausamos el escáner inmediatamente para que no lea el QR 10 veces seguidas
        lectorQR.clear();

        // Validamos que el texto cumpla con nuestra regla de negocio: NRC;FECHA
        if (textoQR && textoQR.includes(";")) {
            const partes = textoQR.split(";");
            const nrcLeido = partes[0];
            const fechaLeida = partes[1];

            // Hora formato 12h (Ej: 10:30 AM)
            const horaActual = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Clave primaria compuesta para bloquear duplicados
            const idAsistenciaUnico = `${matriculaAlumno}_${nrcLeido}_${fechaLeida}`;

            try {
                const dbRef = ref(db);
                // Buscamos si este alumno ya se registró en esta materia hoy
                const snapshot = await get(child(dbRef, `Asistencias/${idAsistenciaUnico}`));

                if (snapshot.exists()) {
                    alert("Ya tienes una asistencia registrada para esta clase el día de hoy.");
                    window.location.href = "menu.html";
                } else {
                    // Guardamos la asistencia en la base de datos
                    const nuevaAsistencia = {
                        id: idAsistenciaUnico,
                        matricula: matriculaAlumno,
                        nombre: nombreAlumno,
                        fecha: fechaLeida,
                        hora: horaActual,
                        nrc: nrcLeido
                    };

                    await set(ref(db, `Asistencias/${idAsistenciaUnico}`), nuevaAsistencia);
                    
                    // Si todo salió bien, enviamos al alumno a la pantalla de éxito
                    window.location.href = "exito.html"; 
                }
            } catch (error) {
                alert("Error de conexión al registrar: " + error.message);
                window.location.href = "menu.html";
            }
        } else {
            alert("Código QR inválido. Asegúrate de escanear el código correcto de la clase.");
            window.location.href = "menu.html";
        }

    }, (errorDeLectura) => {
        // Los errores de lectura ocurren constantemente cuando la cámara no detecta un QR. 
        // Los ignoramos silenciosamente para que siga buscando.
    });
});