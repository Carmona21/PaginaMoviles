// js/lista_clases.js
import { db } from "./firebase-config.js";
import { ref, onValue, remove, set } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorClases");
    
    // Modal de Edición
    const mEditarClase = new bootstrap.Modal(document.getElementById('modalEditarClase'));
    const modalId = document.getElementById('modalIdClase');
    const modalNombre = document.getElementById('modalEtNombre');
    const modalNrc = document.getElementById('modalEtNrc');
    const modalEstudiantes = document.getElementById('modalEtEstudiantes');
    const modalHorario = document.getElementById('modalEtHorario');
    const btnGuardarModal = document.getElementById('btnGuardarCambiosModal');

    // Modal de Eliminación (NUEVO)
    const modalEliminarClaseBS = new bootstrap.Modal(document.getElementById('modalEliminarClase'));
    const btnConfirmarEliminarClase = document.getElementById('btnConfirmarEliminarClase');
    const txtMensajeEliminarClase = document.getElementById('txtMensajeEliminarClase');
    let idClaseAEliminar = null; // Variable temporal

    modalNrc.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    const clasesRef = ref(db, 'Clases');
    onValue(clasesRef, (snapshot) => {
        contenedor.innerHTML = ""; 

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const clase = childSnapshot.val();
                
                const divCol = document.createElement("div");
                divCol.className = "col-12 col-md-6 col-lg-4"; 
                divCol.innerHTML = `
                    <div class="card shadow h-100 border-0" style="background-color: #D5FFFF; border-radius: 20px; cursor: pointer; transition: transform 0.2s;">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold text-dark mb-0 text-truncate" style="max-width: 70%; font-size: 1.1rem;">
                                    ${clase.nombre}
                                </h5>
                                <div>
                                    <button class="btn btn-link p-1 text-dark btn-editar" title="Editar clase">
                                        <i class="bi bi-pencil-fill fs-5"></i>
                                    </button>
                                    <button class="btn btn-link p-1 text-danger btn-eliminar" title="Eliminar clase">
                                        <i class="bi bi-trash-fill fs-5"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-secondary small mb-3" style="font-size: 0.9rem;">NRC: ${clase.nrc}</p>
                            <div class="d-flex justify-content-between align-items-end mt-3">
                                <span class="small text-dark" style="font-size: 0.85rem;">${clase.horario}</span>
                                <span class="fw-bold text-success small" style="font-size: 0.85rem;">Inscritos: ${clase.estudiantesInscritos}</span>
                            </div>
                        </div>
                    </div>
                `;

                const cardElement = divCol.querySelector('.card');
                const btnEditar = divCol.querySelector('.btn-editar');
                const btnEliminar = divCol.querySelector('.btn-eliminar');

                cardElement.addEventListener('mouseenter', () => cardElement.style.transform = 'scale(1.02)');
                cardElement.addEventListener('mouseleave', () => cardElement.style.transform = 'scale(1)');

                cardElement.addEventListener("click", () => {
                    localStorage.setItem("nrcActual", clase.nrc);
                    localStorage.setItem("nombreClase", clase.nombre);
                    window.location.href = "menu.html";
                });

                btnEditar.addEventListener("click", (e) => {
                    e.stopPropagation(); 
                    modalId.value = clase.id;
                    modalNombre.value = clase.nombre;
                    modalNrc.value = clase.nrc;
                    modalEstudiantes.value = clase.estudiantesInscritos;
                    modalHorario.value = clase.horario;
                    mEditarClase.show(); 
                });

                // NUEVA ACCIÓN AL PRESIONAR EL BOTE DE BASURA
                btnEliminar.addEventListener("click", (e) => {
                    e.stopPropagation(); 
                    idClaseAEliminar = clase.id; // Guardamos el ID temporalmente
                    txtMensajeEliminarClase.innerText = `¿Estás seguro de eliminar la materia "${clase.nombre}" y todos sus datos?`;
                    modalEliminarClaseBS.show(); // Mostramos la alerta bonita
                });

                contenedor.appendChild(divCol);
            });
        } else {
            contenedor.innerHTML = `<p class="text-center text-muted col-12">No hay materias registradas en la base de datos.</p>`;
        }
    });

    // LÓGICA DE CONFIRMACIÓN DE BORRADO (Se ejecuta al dar "Sí, eliminar")
    btnConfirmarEliminarClase.addEventListener('click', async () => {
        if (idClaseAEliminar) {
            try {
                await remove(ref(db, `Clases/${idClaseAEliminar}`));
                modalEliminarClaseBS.hide(); // Ocultamos modal
                idClaseAEliminar = null; // Limpiamos memoria
            } catch (error) {
                alert("Error de comunicación con la nube: " + error.message);
            }
        }
    });

    btnGuardarModal.addEventListener('click', async () => {
        const idVal = modalId.value;
        const nombreVal = modalNombre.value.trim();
        const nrcVal = modalNrc.value.trim();
        const estudiantesStr = modalEstudiantes.value.trim();
        const horarioVal = modalHorario.value.trim();

        if (nombreVal === "" || nrcVal.length !== 5 || estudiantesStr === "" || horarioVal === "") {
            alert("Campos inválidos o incompletos");
            return;
        }

        const estudiantesVal = parseInt(estudiantesStr, 10);

        try {
            const claseActualizada = {
                id: idVal,
                nombre: nombreVal,
                nrc: nrcVal,
                estudiantesInscritos: estudiantesVal,
                horario: horarioVal
            };

            await set(ref(db, `Clases/${idVal}`), claseActualizada);
            mEditarClase.hide(); 
        } catch (error) {
            alert("Error de red al actualizar: " + error.message);
        }
    });
});