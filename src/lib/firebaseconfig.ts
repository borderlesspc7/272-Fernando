import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFcOCzXM9lTq0KCcq2IlxgnY7CGD_4neQ",
  authDomain: "fernando-c64ea.firebaseapp.com",
  projectId: "fernando-c64ea",
  storageBucket: "fernando-c64ea.firebasestorage.app",
  messagingSenderId: "867435128542",
  appId: "1:867435128542:web:7db3e7618e495e3aaac44f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export default firebaseConfig;
