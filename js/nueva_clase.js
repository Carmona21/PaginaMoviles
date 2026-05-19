// js/nueva_clase.js
import { db } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('claseForm');
    const txtTituloPantalla = document.getElementById('txtTituloPantalla');
    
    const etNombre = document.getElementById('etNombreClase');
    const etNrc = document.getElementById('etNrcClase');
    const etEstudiantes = document.getElementById('etEstudiantesClase');
    const etHorario = document.getElementById('etHorarioClase');

    // 1. Validar si es modo Edición
    const urlParams = new URLSearchParams(window.location.search);
    const esEdicion = urlParams.get('editar') === 'true';
    let claseEdicionData = null;

    if (esEdicion) {
        const dataRaw = localStorage.getItem("claseAEditar");
        if (dataRaw) {
            claseEdicionData = JSON.parse(dataRaw);
            txtTituloPantalla.innerText = "Editar Clase";
            
            etNombre.value = claseEdicionData.nombre;
            etNrc.value = claseEdicionData.nrc;
            etEstudiantes.value = claseEdicionData.estudiantesInscritos;
            etHorario.value = claseEdicionData.horario;
        }
    }

    // --- RESTRICCIONES EN TIEMPO REAL ---

    // 1. Nombre: Bloquear números y símbolos, solo letras y espacios
    etNombre.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });

    // 2. NRC: Estrictamente números, máximo 5 dígitos (respaldado por maxlength en HTML)
    etNrc.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    });

    // 3. Estudiantes: Solo números y tope máximo de 100
    etEstudiantes.addEventListener('input', (e) => {
        // Remover cualquier letra
        let valorNum = e.target.value.replace(/[^0-9]/g, '');
        
        // Convertir a entero para evaluar el límite
        if (valorNum !== "") {
            let cantidad = parseInt(valorNum, 10);
            if (cantidad > 100) {
                valorNum = "100"; // Topar automáticamente en 100
            }
        }
        e.target.value = valorNum;
    });

    // --- VALIDACIÓN FINAL AL GUARDAR ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombreVal = etNombre.value.trim();
        const nrcVal = etNrc.value.trim();
        const estudiantesStr = etEstudiantes.value.trim();
        const horarioVal = etHorario.value.trim();

        // Limpiar errores visuales previos
        [etNombre, etNrc, etEstudiantes, etHorario].forEach(el => el.classList.remove('is-invalid'));

        let hayError = false;

        if (nombreVal === "" || nombreVal.length < 4) {
            etNombre.classList.add('is-invalid');
            hayError = true;
        }

        if (nrcVal.length !== 5) {
            etNrc.classList.add('is-invalid');
            hayError = true;
        }

        const estudiantesVal = parseInt(estudiantesStr, 10);
        if (estudiantesStr === "" || isNaN(estudiantesVal) || estudiantesVal < 1 || estudiantesVal > 100) {
            etEstudiantes.classList.add('is-invalid');
            hayError = true;
        }

        if (horarioVal === "") {
            etHorario.classList.add('is-invalid');
            hayError = true;
        }

        if (hayError) {
            alert("Por favor corrige los campos marcados en rojo. Recuerda que el NRC requiere 5 dígitos y el máximo de estudiantes es 100.");
            return;
        }

        // --- CONEXIÓN A FIREBASE ---
        try {
            const clasesRef = ref(db, 'Clases');
            let claseId = "";

            if (esEdicion && claseEdicionData) {
                claseId = claseEdicionData.id;
            } else {
                const nuevaClaseRef = push(clasesRef);
                claseId = nuevaClaseRef.key;
            }

            const claseObjeto = {
                id: claseId,
                nombre: nombreVal,
                nrc: nrcVal,
                estudiantesInscritos: estudiantesVal,
                horario: horarioVal
            };

            await set(ref(db, `Clases/${claseId}`), claseObjeto);

            alert(esEdicion ? "Materia modificada con éxito" : "Materia registrada con éxito");
            
            localStorage.removeItem("claseAEditar");
            window.location.href = "lista_clases.html";

        } catch (error) {
            alert("Error de red al actualizar/guardar: " + error.message);
        }
    });
});