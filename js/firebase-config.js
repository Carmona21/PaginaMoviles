// js/firebase-config.js

// 1. Importar la inicialización principal
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

// 2. Importar el servicio de Realtime Database (¡vital para replicar tu app Android!)
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

// 3. Tu configuración oficial
const firebaseConfig = {
  apiKey: "AIzaSyBlS6Por3XMgyXXMhp9p-QcfrfB0N2FnmY",
  authDomain: "basedatosappasistenciaqr.firebaseapp.com",
  databaseURL: "https://basedatosappasistenciaqr-default-rtdb.firebaseio.com",
  projectId: "basedatosappasistenciaqr",
  storageBucket: "basedatosappasistenciaqr.firebasestorage.app",
  messagingSenderId: "443335342223",
  appId: "1:443335342223:web:4f71914c0aafd1680158fa"
};

// 4. Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 5. Exportar la base de datos para usarla en login.js, gestion.js, etc.
export const db = getDatabase(app);