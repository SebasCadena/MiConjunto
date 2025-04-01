// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Para autenticación
import { getFirestore } from "firebase/firestore"; // Para base de datos
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWzF6fI6XSdKm7EtkMHfj3kqeKVn7ZNnY",
  authDomain: "miconjunto-166a5.firebaseapp.com",
  projectId: "miconjunto-166a5",
  storageBucket: "miconjunto-166a5.firebasestorage.app",
  messagingSenderId: "944700551762",
  appId: "1:944700551762:web:a4092df670184b81c8e58b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };