// js/editar_asistencia.js
import { db } from "./firebase-config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEditarAsistencia");
    const etMatricula = document.getElementById("etMatricula");
    const etNombre = document.getElementById("etNombre");
    const etFecha = document.getElementById("etFecha");
    const etHora = document.getElementById("etHora");

    // 1. Recuperar el registro temporal guardado por gestion.js
    const dataRaw = localStorage.getItem("asistenciaAEditar");
    if (!dataRaw) {
        alert("No se detectó ninguna asistencia para editar.");
        window.location.href = "gestion.html";
        return;
    }

    const asistencia = JSON.parse(dataRaw);

    // Funciones auxiliares para formato de hora (AM/PM <-> 24h)
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
    etMatricula.disabled = true; // Se bloquea la matrícula porque es parte de la llave primaria compuesta
    
    etNombre.value = asistencia.nombre;
    etFecha.value = asistencia.fecha; // input type="date" requiere YYYY-MM-DD (que ya tenemos)
    etHora.value = convertirA24h(asistencia.hora); // Adaptamos para el input type="time"

    // 3. Capturar evento de guardado
    // 3. Capturar evento de guardado
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevoNombre = etNombre.value.trim();
        const nuevaFecha = etFecha.value;
        const nuevaHora24 = etHora.value;
        
        const hoyStr = new Date().toLocaleDateString('en-CA'); 

        // Limpiamos los estilos de error previos (no incluimos la matrícula porque esa está bloqueada/disabled)
        [etNombre, etFecha, etHora].forEach(el => el.classList.remove('is-invalid'));

        let hayError = false;

        if (nuevoNombre === "") { 
            etNombre.classList.add('is-invalid'); 
            hayError = true; 
        }
        
        if (nuevaHora24 === "") { 
            etHora.classList.add('is-invalid'); 
            hayError = true; 
        }

        // Validamos que no esté vacía y que no sea una fecha en el futuro
        if (nuevaFecha === "" || nuevaFecha > hoyStr) { 
            etFecha.classList.add('is-invalid'); 
            hayError = true; 
        }

        if (hayError) {
            alert("Por favor, verifica los campos en rojo. Recuerda que no puedes usar fechas futuras.");
            return;
        }

        try {
            // Reconstruimos el objeto manteniendo el ID inmutable
            const asistenciaActualizada = {
                id: asistencia.id,
                matricula: asistencia.matricula, // Viene del objeto original ya que el input está disabled
                nombre: nuevoNombre,
                fecha: nuevaFecha,
                hora: convertirA12h(nuevaHora24), // Regresamos al formato AM/PM para la base de datos
                nrc: asistencia.nrc
            };

            // Sobreescribimos el nodo original
            await set(ref(db, `Asistencias/${asistencia.id}`), asistenciaActualizada);

            alert("Registro de asistencia actualizado correctamente.");
            
            // Limpiamos la memoria y volvemos
            localStorage.removeItem("asistenciaAEditar");
            window.location.href = "gestion.html";

        } catch (error) {
            alert("Error de conexión al actualizar: " + error.message);
        }
    });
});