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

        if (correoIngresado === "" || passIngresada === "") {
            // Equivalente a Toast.makeText(...)
            alert("Ingresa tus credenciales");
            return;
        }

        try {
            // Referencia a la tabla de Usuarios
            // Equivalente a: DatabaseReference reference = FirebaseDatabase.getInstance().getReference("Usuarios");
            const usuariosRef = ref(db, 'Usuarios');

            // Buscamos al usuario por su correo
            // Equivalente a: Query checkUser = reference.orderByChild("correo").equalTo(correoIngresado);
            const checkUser = query(usuariosRef, orderByChild('correo'), equalTo(correoIngresado));

            // Equivalente a: checkUser.addListenerForSingleValueEvent(...)
            const snapshot = await get(checkUser);

            if (snapshot.exists()) {
                let usuarioValido = false;

                // El usuario existe, iteramos sobre los resultados (snapshot.getChildren())
                snapshot.forEach((userSnapshot) => {
                    const userDB = userSnapshot.val();
                    const passDB = userDB.contrasena;

                    if (passDB !== undefined && passDB === passIngresada) {
                        usuarioValido = true;
                        
                        const rol = userDB.rol;
                        const nombreDB = userDB.nombre;
                        const matriculaDB = userDB.matricula;

                        // Equivalente a getSharedPreferences("SESION", MODE_PRIVATE).edit().putString(...).apply();
                        // En la web usamos localStorage para guardar la sesión
                        localStorage.setItem("nombre", nombreDB);
                        localStorage.setItem("matricula", matriculaDB);
                        
                        // NOTA: Como en la web no tenemos Intent.putExtra(), también guardamos el rol aquí
                        localStorage.setItem("rol", rol); 

                        accederSegunRol(rol);
                    }
                });

                if (!usuarioValido) {
                    alert("Contraseña incorrecta");
                }
            } else {
                alert("El usuario no existe");
            }
        } catch (error) {
            // Equivalente a public void onCancelled(@NonNull DatabaseError error)
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