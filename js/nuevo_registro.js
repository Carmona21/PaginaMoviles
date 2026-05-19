// js/nuevo_registro.js
import { db } from "./firebase-config.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");
    const nrcActual = localStorage.getItem("nrcActual");
    
    if (rol !== "admin" || !nrcActual) {
        alert("Acceso denegado.");
        window.location.href = "menu.html";
        return;
    }

    document.getElementById("tvSubtituloNuevo").innerText = `Materia activa - NRC: ${nrcActual}`;

    const form = document.getElementById("formNuevoRegistro");
    const etMatricula = document.getElementById("etMatricula");
    const etNombre = document.getElementById("etNombre");
    const etFecha = document.getElementById("etFecha");
    const etHora = document.getElementById("etHora");

    // --- RESTRICCIONES EN TIEMPO REAL ---

    // Restricción para permitir solo números en el campo de matrícula
    etMatricula.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // NUEVO: Bloquear números y símbolos en el Nombre, solo permite letras y espacios
    etNombre.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });

    // Precargar fecha/hora y limitar el calendario para que no permita fechas futuras
    const ahora = new Date();
    const hoyStr = ahora.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD local
    
    etFecha.value = hoyStr; 
    etFecha.max = hoyStr; // Esta propiedad HTML bloquea los días de mañana en adelante en el calendario
    
    etHora.value = ahora.toTimeString().substring(0, 5); 

    // Función auxiliar para convertir la hora a AM/PM
    const convertirA12h = (hora24) => {
        if (!hora24) return "";
        let [hours, minutes] = hora24.split(':');
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // --- VALIDACIÓN FINAL ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const matriculaVal = etMatricula.value.trim();
        const nombreVal = etNombre.value.trim();
        const fechaVal = etFecha.value;
        const hora24Val = etHora.value;

        // Limpiamos errores visuales de intentos anteriores
        [etMatricula, etNombre, etFecha, etHora].forEach(el => el.classList.remove('is-invalid'));

        let hayError = false;

        if (matriculaVal.length !== 9) {
            etMatricula.classList.add('is-invalid');
            hayError = true;
        }

        if (nombreVal === "" || nombreVal.length < 3) {
            etNombre.classList.add('is-invalid');
            hayError = true;
        }

        // Validación extra de fecha por si alguien burla el límite del HTML
        if (fechaVal === "") {
            etFecha.classList.add('is-invalid');
            hayError = true;
        } else {
            const fechaIngresada = new Date(fechaVal);
            const fechaLimite = new Date(hoyStr);
            
            if (fechaIngresada > fechaLimite) {
                etFecha.classList.add('is-invalid');
                alert("No es posible registrar asistencias en una fecha futura.");
                hayError = true;
            }
        }

        if (hora24Val === "") {
            etHora.classList.add('is-invalid');
            hayError = true;
        }

        if (hayError) return;

        try {
            const dbRef = ref(db);
            const idCompuesto = `${matriculaVal}_${nrcActual}_${fechaVal}`;
            
            const snapshot = await get(child(dbRef, `Asistencias/${idCompuesto}`));

            if (snapshot.exists()) {
                alert("Este alumno ya tiene una asistencia registrada para esta materia en la fecha seleccionada.");
                return;
            }

            const nuevaAsistencia = {
                id: idCompuesto,
                matricula: matriculaVal,
                nombre: nombreVal,
                fecha: fechaVal,
                hora: convertirA12h(hora24Val),
                nrc: nrcActual
            };

            await set(ref(db, `Asistencias/${idCompuesto}`), nuevaAsistencia);

            alert("Asistencia registrada exitosamente.");
            window.location.href = "gestion.html";

        } catch (error) {
            alert("Error de conexión al registrar: " + error.message);
        }
    });
});