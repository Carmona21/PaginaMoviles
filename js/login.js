// js/login.js
import { db } from "./firebase-config.js";
import { ref, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    // Equivalente a findViewById(R.id...)
    const loginForm = document.getElementById('loginForm');
    const etCorreo = document.getElementById('etCorreoLogin');
    const etPass = document.getElementById('etPassLogin');

    // Equivalente a btnLogin.setOnClickListener(...)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario
        validarUsuario();
    });

    async function validarUsuario() {
        const correoIngresado = etCorreo.value.trim();
        const passIngresada = etPass.value.trim();
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // 1. Limpiamos alertas previas
        etCorreo.classList.remove('is-invalid');
        etPass.classList.remove('is-invalid');

        let hayError = false;

        // 2. Validamos cada campo individualmente
        if (correoIngresado === "" || !regexCorreo.test(correoIngresado)) {
            etCorreo.classList.add('is-invalid');
            hayError = true;
        }
        
        if (passIngresada === "") {
            etPass.classList.add('is-invalid');
            hayError = true;
        }

        // 3. Detenemos la ejecución si hay errores
        if (hayError) {
            alert("Por favor, verifica los campos marcados en rojo.");
            return;
        }

        try {
            const usuariosRef = ref(db, 'Usuarios');
            const checkUser = query(usuariosRef, orderByChild('correo'), equalTo(correoIngresado));
            const snapshot = await get(checkUser);

            if (snapshot.exists()) {
                let usuarioValido = false;

                snapshot.forEach((userSnapshot) => {
                    const userDB = userSnapshot.val();
                    const passDB = userDB.contrasena;

                    if (passDB !== undefined && passDB === passIngresada) {
                        usuarioValido = true;
                        
                        const rol = userDB.rol;
                        const nombreDB = userDB.nombre;
                        const matriculaDB = userDB.matricula;

                        localStorage.setItem("nombre", nombreDB);
                        localStorage.setItem("matricula", matriculaDB);
                        localStorage.setItem("rol", rol); 

                        accederSegunRol(rol);
                    }
                });

                if (!usuarioValido) {
                    etPass.classList.add('is-invalid');
                    alert("Contraseña incorrecta");
                }
            } else {
                etCorreo.classList.add('is-invalid');
                alert("El usuario no existe");
            }
        } catch (error) {
            alert("Error de conexión: " + error.message);
        }
    }

    function accederSegunRol(rol) {
        if (rol !== undefined && rol === "admin") {
            // MODIFICADO: El profesor va primero a seleccionar o crear su clase
            // Equivalente a: Intent intent = new Intent(MainActivity.this, ListaClases.class); startActivity(intent); finish();
            window.location.href = "lista_clases.html";
        } else {
            // El alumno va directo al menú simplificado
            // Equivalente a: Intent intent = new Intent(MainActivity.this, pantallaMenu.class); startActivity(intent); finish();
            window.location.href = "menu.html";
        }
    }
});