// js/editar_asistencia.js
import { db } from "./firebase-config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEditarAsistencia");
    const etMatricula = document.getElementById("etMatricula");
    const etNombre = document.getElementById("etNombre");
    const etFecha = document.getElementById("etFecha");
    const etHora = document.getElementById("etHora");
    const tvSubtituloEditar = document.getElementById("tvSubtituloEditar");

    // 1. Recuperar el registro que se quiere editar
    const dataRaw = localStorage.getItem("asistenciaAEditar");
    if (!dataRaw) {
        alert("No se detectó ninguna asistencia para editar.");
        window.location.href = "gestion.html";
        return;
    }

    const asistencia = JSON.parse(dataRaw);
    if (tvSubtituloEditar) {
        tvSubtituloEditar.innerText = `Modificando registro de NRC: ${asistencia.nrc}`;
    }

    // Funciones de formato de hora
    const convertirA24h = (hora12) => {
        if (!hora12 || !hora12.includes(" ")) return hora12;
        const [time, modifier] = hora12.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    const convertirA12h = (hora24) => {
        if (!hora24) return "";
        let [hours, minutes] = hora24.split(':');
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // 2. Poblar los campos con los datos actuales
    etMatricula.value = asistencia.matricula;
    etNombre.value = asistencia.nombre;
    etFecha.value = asistencia.fecha; 
    etHora.value = convertirA24h(asistencia.hora);

    // --- RESTRICCIONES EN TIEMPO REAL ---

    // Bloquear fechas futuras en el calendario HTML
    const hoyStr = new Date().toLocaleDateString('en-CA');
    etFecha.max = hoyStr;

    // Bloquear números y caracteres especiales en el Nombre
    etNombre.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });

    // 3. Capturar evento de guardado y validar
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevoNombre = etNombre.value.trim();
        const nuevaFecha = etFecha.value;
        const nuevaHora24 = etHora.value;

        // Limpiamos alertas visuales de errores previos
        [etNombre, etFecha, etHora].forEach(el => el.classList.remove('is-invalid'));
        let hayError = false;

        // Validaciones Finales
        if (nuevoNombre === "" || nuevoNombre.length < 3) {
            etNombre.classList.add('is-invalid');
            hayError = true;
        }

        if (nuevaFecha === "") {
            etFecha.classList.add('is-invalid');
            hayError = true;
        } else {
            // Verificamos por si el usuario evadió la restricción HTML de alguna forma
            const fechaIngresada = new Date(nuevaFecha);
            const fechaLimite = new Date(hoyStr);
            if (fechaIngresada > fechaLimite) {
                etFecha.classList.add('is-invalid');
                alert("No es posible registrar una asistencia en el futuro.");
                hayError = true;
            }
        }

        if (nuevaHora24 === "") {
            etHora.classList.add('is-invalid');
            hayError = true;
        }

        if (hayError) {
            alert("Por favor corrige los campos marcados en rojo.");
            return;
        }

        // 4. Guardar datos validados
        try {
            const asistenciaActualizada = {
                id: asistencia.id,
                matricula: asistencia.matricula, 
                nombre: nuevoNombre,
                fecha: nuevaFecha,
                hora: convertirA12h(nuevaHora24), 
                nrc: asistencia.nrc
            };

            await set(ref(db, `Asistencias/${asistencia.id}`), asistenciaActualizada);

            alert("Registro de asistencia actualizado correctamente.");
            localStorage.removeItem("asistenciaAEditar");
            window.location.href = "gestion.html";

        } catch (error) {
            alert("Error de conexión al actualizar: " + error.message);
        }
    });
});