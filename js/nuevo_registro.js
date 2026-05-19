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
        
        const regexMatricula = /^\d{9}$/;
        const hoyStr = new Date().toLocaleDateString('en-CA'); 

        // Limpiar errores visuales
        [etMatricula, etNombre, etFecha, etHora].forEach(el => el.classList.remove('is-invalid'));
        
        let hayError = false;

        if (!regexMatricula.test(matriculaVal)) { etMatricula.classList.add('is-invalid'); hayError = true; }
        if (nombreVal === "") { etNombre.classList.add('is-invalid'); hayError = true; }
        if (hora24Val === "") { etHora.classList.add('is-invalid'); hayError = true; }
        
        if (fechaVal === "" || fechaVal > hoyStr) { 
            etFecha.classList.add('is-invalid'); 
            hayError = true; 
        }

        if (hayError) {
            alert("Por favor, verifica los campos en rojo. Recuerda que no puedes registrar fechas futuras.");
            return;
        }

        try {
            const idCompuesto = `${matriculaVal}_${nrcActual}_${fechaVal}`;
            const snapshot = await get(child(ref(db), `Asistencias/${idCompuesto}`));

            if (snapshot.exists()) {
                alert("Este alumno ya tiene una asistencia registrada para esta materia en la fecha seleccionada.");
                return;
            }

            await set(ref(db, `Asistencias/${idCompuesto}`), {
                id: idCompuesto,
                matricula: matriculaVal,
                nombre: nombreVal,
                fecha: fechaVal,
                hora: convertirA12h(hora24Val), 
                nrc: nrcActual
            });

            alert("Asistencia registrada exitosamente.");
            window.location.href = "gestion.html";

        } catch (error) {
            alert("Error de conexión al registrar: " + error.message);
        }
    });
});