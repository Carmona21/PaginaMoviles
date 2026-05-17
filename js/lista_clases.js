// js/lista_clases.js
import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorClases");
    
    // Apuntamos a la tabla "Clases" en Firebase
    const clasesRef = ref(db, 'Clases');

    // Escuchamos en tiempo real igual que en Android
    onValue(clasesRef, (snapshot) => {
        contenedor.innerHTML = ""; // Limpiamos el texto de "Cargando"

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const clase = childSnapshot.val();
                
                // Construimos el equivalente visual a tu item_clase.xml
                const card = document.createElement("div");
                card.className = "col-12 col-md-5 col-lg-4";
                card.innerHTML = `
                    <div class="card shadow-sm h-100 border-0 rounded-4" style="cursor: pointer; transition: transform 0.2s;">
                        <div class="card-body p-4 text-center">
                            <h4 class="fw-bold mb-1">${clase.nombre}</h4>
                            <p class="text-muted small mb-3">NRC: ${clase.nrc}</p>
                            <span class="badge bg-dark rounded-pill px-3 py-2 mb-2">
                                <i class="bi bi-people-fill me-1"></i> ${clase.estudiantesInscritos} inscritos
                            </span>
                            <p class="small text-secondary mt-2 mb-0">
                                <i class="bi bi-clock me-1"></i> ${clase.horario}
                            </p>
                        </div>
                    </div>
                `;

                // Añadimos el efecto hover sutil
                card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.03)');
                card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');

                // Replicamos el Intent nativo: guardar NRC y avanzar
                card.addEventListener("click", () => {
                    localStorage.setItem("nrcActual", clase.nrc);
                    localStorage.setItem("nombreClase", clase.nombre);
                    window.location.href = "menu.html";
                });

                contenedor.appendChild(card);
            });
        } else {
            contenedor.innerHTML = `<p class="text-center text-muted">No hay materias registradas en la base de datos.</p>`;
        }
    });
});