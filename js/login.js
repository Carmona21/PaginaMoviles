// js/login.js
import { db } from "./firebase-config.js";
import { ref, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const correo = document.getElementById('etCorreoLogin').value.trim();
    const contrasena = document.getElementById('etPassLogin').value.trim();

    try {
        // Apuntamos al nodo de Usuarios en Realtime Database
        const usuariosRef = ref(db, 'Usuarios');
        const q = query(usuariosRef, orderByChild('correo'), equalTo(correo));
        
        // Ejecutamos la consulta
        const snapshot = await get(q);

        if (snapshot.exists()) {
            let usuarioValido = false;
            
            snapshot.forEach((childSnapshot) => {
                const userDB = childSnapshot.val();
                
                // Validamos la contraseña
                if (userDB.contrasena === contrasena) {
                    usuarioValido = true;
                    
                    // Guardamos la sesión localmente
                    localStorage.setItem("nombre", userDB.nombre);
                    localStorage.setItem("matricula", userDB.matricula);
                    localStorage.setItem("rol", userDB.rol);

                    alert(`¡Bienvenido ${userDB.nombre}!`);

                    // Redirección según el rol
                    if (userDB.rol === "admin") {
                        window.location.href = "lista_clases.html"; 
                    } else {
                        window.location.href = "menu.html";
                    }
                }
            });

            if (!usuarioValido) alert("Contraseña incorrecta");
        } else {
            alert("El usuario no existe");
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
});