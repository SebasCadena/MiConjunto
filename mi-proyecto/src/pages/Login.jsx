// filepath: /home/sebas_cadena/Documentos/Software/MiConjunto/mi-proyecto/src/pages/Login.jsx
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    try {
      console.log("Iniciando sesión...");
      // Autentica al usuario con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuario autenticado:", userCredential.user);
  
      // Obtén el UID del usuario autenticado
      const uid = userCredential.user.uid;
      console.log("UID del usuario:", uid);
  
      // Busca el documento del usuario en Firestore usando el UID
      const userDoc = await getDoc(doc(db, "users", uid));
      console.log("Documento del usuario:", userDoc.exists() ? userDoc.data() : "No encontrado");
  
      if (userDoc.exists()) {
        // Obtén el rol del usuario desde Firestore
        const role = userDoc.data().rol;
        console.log("Rol del usuario:", role);
  
        // Redirige según el rol
        navigate(role === "dueño" ? "/dueño" : "/inquilino");
      } else {
        // Si no se encuentra el documento, muestra un error
        setError("No se encontraron datos del usuario en Firestore.");
        console.error("No se encontraron datos del usuario en Firestore.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;