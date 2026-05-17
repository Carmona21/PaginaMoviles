// js/login.js
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const correo = document.getElementById('etCorreoLogin').value;
    const contrasena = document.getElementById('etPassLogin').value;

    signInWithEmailAndPassword(auth, correo, contrasena)
        .then((userCredential) => {
            alert("¡Bienvenido!");
            // Al cambiar de página, la ruta es relativa al HTML, no al JS
            window.location.href = "menu.html"; 
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert("Error al iniciar sesión: " + errorMessage);
        });
});