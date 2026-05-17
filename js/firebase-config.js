// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Tu configuración de Firebase extraída del JSON de Android
const firebaseConfig = {
  apiKey: "AIzaSyAYw7FNTX9c3MNDpt2v58LkGENHA13UQ5Q",
  authDomain: "basedatosappasistenciaqr.firebaseapp.com",
  projectId: "basedatosappasistenciaqr",
  storageBucket: "basedatosappasistenciaqr.firebasestorage.app",
  messagingSenderId: "443335342223"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios para que los uses en tus pantallas HTML
export const auth = getAuth(app);
export const db = getFirestore(app);