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

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const regexMatricula = /^\d{9}$/; 

            // Limpiamos estilos de error
            [etNombre, etCorreo, etPass, etMatricula, etCodigoMaestro].forEach(el => {
                if(el) el.classList.remove('is-invalid');
            });

            let hayError = false;

            if (nombre === "") { etNombre.classList.add('is-invalid'); hayError = true; }
            if (correo === "" || !regexCorreo.test(correo)) { etCorreo.classList.add('is-invalid'); hayError = true; }
            if (pass === "") { etPass.classList.add('is-invalid'); hayError = true; }

            if (rolSeleccionado === "maestro") {
                const codigoIngresado = etCodigoMaestro.value.trim();
                if (codigoIngresado !== "123456") {
                    etCodigoMaestro.classList.add('is-invalid');
                    alert("Código de maestro incorrecto");
                    hayError = true;
                } else {
                    rolFinal = "admin";
                }
            } else {
                matriculaFinal = etMatricula.value.trim();
                if (!regexMatricula.test(matriculaFinal)) {
                    etMatricula.classList.add('is-invalid');
                    alert("La matrícula debe tener exactamente 9 dígitos numéricos");
                    hayError = true;
                }
            }

            if (hayError) return; // Si algún campo se pintó de rojo, detenemos todo

            // --- CONEXIÓN A FIREBASE ---
            try {
                const usuariosRef = ref(db, 'Usuarios');
                const snapshot = await get(usuariosRef);
                let existeDuplicado = false;

                if (snapshot.exists()) {
                    snapshot.forEach((userSnapshot) => {
                        const userDB = userSnapshot.val();
                        
                        if (userDB.correo && userDB.correo.toLowerCase() === correo.toLowerCase()) {
                            etCorreo.classList.add('is-invalid');
                            alert("Este correo ya está registrado");
                            existeDuplicado = true;
                            return true; 
                        }

                        if (rolFinal === "alumno" && userDB.matricula && userDB.matricula === matriculaFinal) {
                            etMatricula.classList.add('is-invalid');
                            alert("Esta matrícula ya pertenece a otra cuenta");
                            existeDuplicado = true;
                            return true; 
                        }
                    });
                }

                if (!existeDuplicado) {
                    const nuevoUsuarioRef = push(usuariosRef);
                    await set(nuevoUsuarioRef, {
                        id: nuevoUsuarioRef.key,
                        nombre: nombre,
                        correo: correo,
                        contrasena: pass, 
                        rol: rolFinal,
                        matricula: matriculaFinal
                    });
                    alert("Cuenta registrada exitosamente");
                    window.location.href = "index.html"; 
                }

            } catch (error) {
                alert("Error de conexión al verificar datos: " + error.message);
            }
        });
    }
});