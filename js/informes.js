// js/informes.js
import { db } from "./firebase-config.js";
import { ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {
    const nrcActual = localStorage.getItem("nrcActual");
    const nombreClase = localStorage.getItem("nombreClase");
    const rol = localStorage.getItem("rol");

    // Seguridad de ruta
    if (rol !== "admin" || !nrcActual) {
        alert("Acceso no autorizado.");
        window.location.href = "index.html";
        return;
    }

    // Cabeceras de texto
    document.getElementById("tvTituloClase").innerText = nombreClase;
    document.getElementById("tvSubtituloInforme").innerText = `Análisis de rendimiento - NRC: ${nrcActual}`;

    const tvAsistencias = document.getElementById("tvPorcentajeAsistencias");
    const tvFaltas = document.getElementById("tvPorcentajeFaltas");
    const ctx = document.getElementById("graficaPastel").getContext("2d");

    try {
        // 1. Obtener la cantidad de "Estudiantes Inscritos" de la base de datos
        const clasesRef = ref(db, 'Clases');
        const qClase = query(clasesRef, orderByChild('nrc'), equalTo(nrcActual));
        const snapshotClase = await get(qClase);

        let estudiantesInscritos = 0;
        if (snapshotClase.exists()) {
            snapshotClase.forEach(child => {
                estudiantesInscritos = child.val().estudiantesInscritos;
            });
        }

        // 2. Extraer el universo de Asistencias Registradas
        const asistenciasRef = ref(db, 'Asistencias');
        const snapshotAsistencias = await get(asistenciasRef);

        let totalAsistenciasReales = 0;
        const fechasUnicas = new Set(); // El Set almacena valores únicos sin duplicar

        if (snapshotAsistencias.exists()) {
            snapshotAsistencias.forEach(child => {
                const asistencia = child.val();
                if (asistencia.nrc === nrcActual) {
                    totalAsistenciasReales++;
                    fechasUnicas.add(asistencia.fecha); // Recopilamos cada día de clase impartido
                }
            });
        }

        // 3. Cálculos lógicos (Idéntico al negocio en Android)
        const diasDeClase = fechasUnicas.size;
        const asistenciasEsperadas = estudiantesInscritos * diasDeClase; // Universo esperado
        
        let faltasCalculadas = asistenciasEsperadas - totalAsistenciasReales;
        if (faltasCalculadas < 0) faltasCalculadas = 0; // Evita valores negativos si hay más asistencias de lo previsto

        let porcentajeAsistencias = 0;
        let porcentajeFaltas = 0;

        if (asistenciasEsperadas > 0) {
            porcentajeAsistencias = Math.round((totalAsistenciasReales / asistenciasEsperadas) * 100);
            porcentajeFaltas = 100 - porcentajeAsistencias;
        }

        // 4. Inyección en los cuadros superiores
        tvAsistencias.innerText = `${porcentajeAsistencias}%`;
        tvFaltas.innerText = `${porcentajeFaltas}%`;

        // 5. Renderizado de Gráfica Pastel (Equivalente a MPAndroidChart)
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Asistencias', 'Faltas / Retardos'],
                datasets: [{
                    data: [totalAsistenciasReales, faltasCalculadas],
                    backgroundColor: ['#28a745', '#dc3545'], // Verde éxito, Rojo peligro
                    hoverBackgroundColor: ['#218838', '#c82333'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permite que el CSS de la caja restrinja el tamaño
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 14, family: 'Arial' },
                            color: '#333'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                label += context.raw + ' alumnos';
                                return label;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error(error);
        alert("Hubo un error al procesar las estadísticas: " + error.message);
    }
});