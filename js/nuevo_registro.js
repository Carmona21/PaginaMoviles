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

    // Mostrar el NRC en la vista para contexto visual
    document.getElementById("tvSubtituloNuevo").innerText = `Materia activa - NRC: ${nrcActual}`;

    const form = document.getElementById("formNuevoRegistro");
    const etMatricula = document.getElementById("etMatricula");
    const etNombre = document.getElementById("etNombre");
    const etFecha = document.getElementById("etFecha");
    const etHora = document.getElementById("etHora");

    // Restricción para permitir solo números en el campo de matrícula
    etMatricula.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Precargar fecha y hora actuales
    const ahora = new Date();
    etFecha.value = ahora.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
    etHora.value = ahora.toTimeString().substring(0, 5); // Formato HH:MM (24h)

    // Función auxiliar para convertir la hora del input (24h) a formato AM/PM
    const convertirA12h = (hora24) => {
        if (!hora24) return "";
        let [hours, minutes] = hora24.split(':');
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const matriculaVal = etMatricula.value.trim();
        const nombreVal = etNombre.value.trim();
        const fechaVal = etFecha.value;
        const hora24Val = etHora.value;

        // Validaciones estrictas
        if (matriculaVal.length !== 9) {
            alert("La matrícula debe contener exactamente 9 dígitos numéricos.");
            etMatricula.focus();
            return;
        }

        if (nombreVal === "" || fechaVal === "" || hora24Val === "") {
            alert("Por favor, completa todos los campos requeridos.");
            return;
        }

        try {
            const dbRef = ref(db);
            const idCompuesto = `${matriculaVal}_${nrcActual}_${fechaVal}`;
            
            // Comprobar que no exista ya un registro para ese alumno, esa clase, ese día
            const snapshot = await get(child(dbRef, `Asistencias/${idCompuesto}`));

            if (snapshot.exists()) {
                alert("Este alumno ya tiene una asistencia registrada para esta materia en la fecha seleccionada.");
                return;
            }

            // Mapeo de datos para Firebase
            const nuevaAsistencia = {
                id: idCompuesto,
                matricula: matriculaVal,
                nombre: nombreVal,
                fecha: fechaVal,
                hora: convertirA12h(hora24Val), // Guarda como "10:15 AM"
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