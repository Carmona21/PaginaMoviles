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

    // 1. Validar el modo de la pantalla (Creación o Edición)
    const urlParams = new URLSearchParams(window.location.search);
    const esEdicion = urlParams.get('editar') === 'true';
    let claseEdicionData = null;

    if (esEdicion) {
        // Recuperamos el objeto serializado guardado en el localStorage
        const dataRaw = localStorage.getItem("claseAEditar");
        if (dataRaw) {
            claseEdicionData = JSON.parse(dataRaw);
            
            // Cambiamos los textos de la interfaz para reflejar el modo edición
            txtTituloPantalla.innerText = "Editar Información de Clase";
            
            // Pre-poblamos los campos con los valores inmutables de Firebase
            etNombre.value = claseEdicionData.nombre;
            etNrc.value = claseEdicionData.nrc;
            etEstudiantes.value = claseEdicionData.estudiantesInscritos;
            etHorario.value = claseEdicionData.horario;
        }
    }

    // Fuerza a que en el campo NRC solo se puedan escribir caracteres numéricos
    etNrc.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // 2. Lógica de guardado al enviar el formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombreVal = etNombre.value.trim();
        const nrcVal = etNrc.value.trim();
        const estudiantesStr = etEstudiantes.value.trim();
        const horarioVal = etHorario.value.trim();

        // --- VALIDACIONES DE NEGOCIO (Idénticas a CrearClase.java / ListaClases.java) ---
        if (nombreVal === "" || nrcVal.length !== 5 || estudiantesStr === "" || horarioVal === "") {
            alert("Campos inválidos o incompletos. Recuerda que el NRC debe tener exactamente 5 números.");
            return;
        }

        const estudiantesVal = parseInt(estudiantesStr, 10);

        try {
            const clasesRef = ref(db, 'Clases');
            let claseId = "";

            // Si es edición usamos su ID original; si es nueva generamos un nodo hijo con push()
            if (esEdicion && claseEdicionData) {
                claseId = claseEdicionData.id;
            } else {
                const nuevaClaseRef = push(clasesRef);
                claseId = nuevaClaseRef.key;
            }

            // Mapeo estructurado idéntico al constructor Clase(id, nombre, nrc, estudiantesInscritos, horario)
            const claseObjeto = {
                id: claseId,
                nombre: nombreVal,
                nrc: nrcVal,
                estudiantesInscritos: estudiantesVal,
                horario: horarioVal
            };

            // Escribimos en el nodo Clases/claseId
            await set(ref(db, `Clases/${claseId}`), claseObjeto);

            alert(esEdicion ? "Materia modificada con éxito" : "Materia registrada con éxito");
            
            // Limpieza preventiva del LocalStorage y redirección
            localStorage.removeItem("claseAEditar");
            window.location.href = "lista_clases.html";

        } catch (error) {
            alert("Error de red al actualizar/guardar: " + error.message);
        }
    });
});