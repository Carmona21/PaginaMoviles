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

    // --- RESTRICCIONES EN TIEMPO REAL ---
    
    // Bloquear números y símbolos en el Nombre (solo permite letras y espacios)
    etNombre.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });

    // Bloquear letras y limitar estrictamente a 9 caracteres en la Matrícula
    if (etMatricula) {
        etMatricula.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
        });
    }

    // 2. Estado Inicial de la vista (Alumno por defecto)
    if (etCodigoMaestro) etCodigoMaestro.style.display = 'none';
    if (etMatricula) etMatricula.style.display = 'block';

    // 3. Mostrar/Ocultar campos dinámicos
    const cambiarRol = () => {
        if (rbMaestro && rbMaestro.checked) {
            etCodigoMaestro.style.display = 'block'; 
            etMatricula.style.display = 'none';      
        } else {
            etCodigoMaestro.style.display = 'none';  
            etMatricula.style.display = 'block';     
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

            // --- EXPRESIONES REGULARES ---
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const regexMatricula = /^\d{9}$/; 
            // Contraseña: Mínimo 8 caracteres, 1 letra mayúscula, 1 letra minúscula y 1 número
            const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            // Limpiamos estilos de error
            [etNombre, etCorreo, etPass, etMatricula, etCodigoMaestro].forEach(el => {
                if(el) el.classList.remove('is-invalid');
            });

            let hayError = false;

            if (nombre === "" || nombre.length < 3) { 
                etNombre.classList.add('is-invalid'); 
                alert("Ingresa un nombre válido.");
                hayError = true; 
            }
            
            if (correo === "" || !regexCorreo.test(correo)) { 
                etCorreo.classList.add('is-invalid'); 
                alert("Ingresa un formato de correo electrónico válido.");
                hayError = true; 
            }
            
            if (!regexPass.test(pass)) { 
                etPass.classList.add('is-invalid'); 
                alert("La contraseña es muy débil. Asegúrate de que tenga al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.");
                hayError = true; 
            }

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

            if (hayError) return; 

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