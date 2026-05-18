// js/gestion.js
import { db } from "./firebase-config.js";
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const nrcActual = localStorage.getItem("nrcActual");
    const nombreClase = localStorage.getItem("nombreClase");
    const rol = localStorage.getItem("rol");

    // Seguridad: Evitar que entren alumnos o accesos directos sin clase
    if (rol !== "admin" || !nrcActual) {
        alert("Acceso no autorizado.");
        window.location.href = "index.html";
        return;
    }

    // Cabeceras visuales
    document.getElementById("tvGestionTitulo").innerText = nombreClase;
    document.getElementById("tvGestionSubtitulo").innerText = `NRC: ${nrcActual}`;

    const filtroFecha = document.getElementById("inputFiltroFecha");
    const recyclerView = document.getElementById("recyclerViewAsistencias");

    // Establecer fecha actual por defecto en el filtro
    const hoy = new Date().toLocaleDateString('en-CA');
    filtroFecha.value = hoy;

    // Instancia y variables exclusivas para el Modal de Eliminación
    const modalEliminarAsistenciaBS = new bootstrap.Modal(document.getElementById('modalEliminarAsistencia'));
    const btnConfirmarEliminarAsistencia = document.getElementById('btnConfirmarEliminarAsistencia');
    const txtMensajeEliminarAsistencia = document.getElementById('txtMensajeEliminarAsistencia');
    let idAsistenciaAEliminar = null; // Variable temporal para saber qué borrar

    // Función principal para leer y renderizar datos en tiempo real
    const cargarAsistencias = () => {
        const fechaSeleccionada = filtroFecha.value;
        const asistenciasRef = ref(db, 'Asistencias');

        onValue(asistenciasRef, (snapshot) => {
            recyclerView.innerHTML = ""; 
            let contadorRegistros = 0;

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const asistencia = childSnapshot.val();

                    // Filtramos por clase y fecha actual
                    if (asistencia.nrc === nrcActual && asistencia.fecha === fechaSeleccionada) {
                        contadorRegistros++;
                        
                        const divItem = document.createElement("div");
                        divItem.className = "asistencia-item bg-white p-3 mb-3 rounded-4 shadow-sm"; 
                        divItem.innerHTML = `
                            <div class="row align-items-center">
                                <div class="col-6 col-md-7">
                                    <h6 class="mb-0 fw-bold text-dark">${asistencia.nombre}</h6>
                                    <small class="text-muted">${asistencia.matricula}</small>
                                </div>
                                <div class="col-4 col-md-3 text-end">
                                    <div class="text-dark fecha-asistencia small">${asistencia.fecha}</div>
                                    <div class="hora-asistencia fw-bold text-success">${asistencia.hora}</div>
                                </div>
                                <div class="col-2 col-md-2 d-flex flex-column align-items-center justify-content-center">
                                    <button class="btn btn-sm btn-link p-0 text-warning mb-1 btn-editar-asistencia">
                                        <i class="bi bi-pencil-square fs-5"></i>
                                    </button>
                                    <button class="btn btn-sm btn-link p-0 text-danger btn-eliminar-asistencia">
                                        <i class="bi bi-trash-fill fs-5"></i>
                                    </button>
                                </div>
                            </div>
                        `;

                        // Acción: Editar (Manda a editar_asistencia.html)
                        divItem.querySelector('.btn-editar-asistencia').addEventListener('click', () => {
                            localStorage.setItem("asistenciaAEditar", JSON.stringify(asistencia));
                            window.location.href = "editar_asistencia.html";
                        });

                        // Acción: Eliminar (Abre el Modal de confirmación)
                        divItem.querySelector('.btn-eliminar-asistencia').addEventListener('click', () => {
                            idAsistenciaAEliminar = asistencia.id;
                            txtMensajeEliminarAsistencia.innerText = `¿Remover la asistencia del alumno ${asistencia.nombre}?`;
                            modalEliminarAsistenciaBS.show();
                        });

                        recyclerView.appendChild(divItem);
                    }
                });
            }

            // Mensaje si no hay datos en ese día
            if (contadorRegistros === 0) {
                recyclerView.innerHTML = `<div class="text-center text-muted py-4">Sin asistencias en esta fecha.</div>`;
            }
        });
    };

    // Escuchador para cuando el profesor cambia de fecha en el calendario superior
    filtroFecha.addEventListener("change", cargarAsistencias);
    
    // Llamada inicial
    cargarAsistencias();

    // Lógica definitiva para eliminar registro tras presionar "Sí, eliminar"
    btnConfirmarEliminarAsistencia.addEventListener('click', async () => {
        if (idAsistenciaAEliminar) {
            try {
                // Borramos el nodo de la base de datos usando el ID temporal
                await remove(ref(db, `Asistencias/${idAsistenciaAEliminar}`));
                
                // Ocultamos ventana y limpiamos variable
                modalEliminarAsistenciaBS.hide();
                idAsistenciaAEliminar = null;
            } catch (err) {
                alert("Error de conexión: " + err.message);
            }
        }
    });
});