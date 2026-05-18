// js/registro.js
import { db } from "./firebase-config.js";
import { ref, get, push, set } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Enlaces a la UI
    const etNombre = document.getElementById('etNombreRegistro');
    const etCorreo = document.getElementById('etCorreoRegistro');
    const etPass = document.getElementById('etPassRegistro');
    const etMatricula = document.getElementById('etMatriculaRegistro');
    const etCodigoMaestro = document.getElementById('etCodigoMaestro');
    
    const rbMaestro = document.getElementById('rbMaestro');
    const rbAlumno = document.getElementById('rbAlumno');
    const btnRegistrar = document.getElementById('btnFinalizarRegistro');

    // 2. Estado Inicial de la vista (Alumno por defecto)
    if (etCodigoMaestro) etCodigoMaestro.style.display = 'none';
    if (etMatricula) etMatricula.style.display = 'block';

    // 3. Mostrar/Ocultar campos dinámicos al cambiar el RadioButton
    const cambiarRol = () => {
        if (rbMaestro && rbMaestro.checked) {
            etCodigoMaestro.style.display = 'block'; // Mostrar código maestro
            etMatricula.style.display = 'none';      // Ocultar matrícula
        } else {
            etCodigoMaestro.style.display = 'none';  // Ocultar código maestro
            etMatricula.style.display = 'block';     // Mostrar matrícula
        }
    };

    if (rbMaestro) rbMaestro.addEventListener('change', cambiarRol);
    if (rbAlumno) rbAlumno.addEventListener('change', cambiarRol);

    // 4. Lógica principal de registro
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', async (e) => {
            e.preventDefault(); 

            const nombre = etNombre.value.trim();
            const correo = etCorreo.value.trim();
            const pass = etPass.value.trim();
            
            let rolSeleccionado = (rbMaestro && rbMaestro.checked) ? "maestro" : "alumno";
            let rolFinal = rolSeleccionado;
            let matriculaFinal = "N/A";

            // --- VALIDACIONES LOCALES ---
            if (nombre === "" || correo === "" || pass === "") {
                alert("Completa todos los campos principales");
                return;
            }

            if (rolSeleccionado === "maestro") {
                const codigoIngresado = etCodigoMaestro.value.trim();
                if (codigoIngresado !== "123456") {
                    alert("Código de maestro incorrecto");
                    etCodigoMaestro.focus();
                    return;
                }
                rolFinal = "admin"; // Clasificación interna en Firebase
            } else {
                matriculaFinal = etMatricula.value.trim();
                if (matriculaFinal === "") {
                    alert("La matrícula es obligatoria para los alumnos");
                    etMatricula.focus();
                    return;
                }
                if (matriculaFinal.length !== 9) {
                    alert("La matrícula debe tener exactamente 9 dígitos");
                    etMatricula.focus();
                    return;
                }
            }

            // --- CONEXIÓN A FIREBASE (Búsqueda de duplicados) ---
            try {
                const usuariosRef = ref(db, 'Usuarios');
                const snapshot = await get(usuariosRef);
                
                let existeDuplicado = false;

                if (snapshot.exists()) {
                    snapshot.forEach((userSnapshot) => {
                        const userDB = userSnapshot.val();
                        const correoDB = userDB.correo;
                        const matriculaDB = userDB.matricula;

                        // A. Evitar correos repetidos
                        if (correoDB && correoDB.toLowerCase() === correo.toLowerCase()) {
                            alert("Este correo ya está registrado");
                            etCorreo.focus();
                            existeDuplicado = true;
                            return true; // Rompe el forEach
                        }

                        // B. Evitar matrículas repetidas (Solo alumnos)
                        if (rolFinal === "alumno" && matriculaDB && matriculaDB === matriculaFinal) {
                            alert("Esta matrícula ya pertenece a otra cuenta");
                            etMatricula.focus();
                            existeDuplicado = true;
                            return true; // Rompe el forEach
                        }
                    });
                }

                // --- GUARDAR USUARIO NUEVO ---
                if (!existeDuplicado) {
                    const nuevoUsuarioRef = push(usuariosRef);
                    const userId = nuevoUsuarioRef.key;

                    const nuevoUsuario = {
                        id: userId,
                        nombre: nombre,
                        correo: correo,
                        contrasena: pass, 
                        rol: rolFinal,
                        matricula: matriculaFinal
                    };

                    await set(nuevoUsuarioRef, nuevoUsuario);

                    alert("Cuenta registrada exitosamente");
                    window.location.href = "index.html"; // Regreso al Login
                }

            } catch (error) {
                alert("Error de conexión al verificar datos: " + error.message);
            }
        });
    }
});