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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuario autenticado:", userCredential.user);

      // Obtén el UID del usuario autenticado
      const uid = userCredential.user.uid;
      console.log("UID del usuario:", uid);

      // Busca el documento del usuario en Firestore usando el UID
      const userDoc = await getDoc(doc(db, "users", uid));
      console.log(
        "Documento del usuario:",
        userDoc.exists() ? userDoc.data() : "No encontrado"
      );

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
    <div className="bg-blue-400 h-screen w-screen">
      <div className="flex flex-col items-center flex-1 h-full justify-center px-4 sm:px-0">
        <div className="flex rounded-lg shadow-lg w-full sm:w-3/4 lg:w-1/2 bg-white sm:mx-0">
          <div className="flex flex-col w-full md:w-1/2 p-4">
            <div className="flex flex-col flex-1 justify-center mb-8">
              <h1 className="text-4xl text-center font-thin">Iniciar sesión</h1>
              <div className="w-full mt-4">
                <form onSubmit={handleLogin} className="w-full mt-4">
                  <div className="flex flex-col mt-4">
                    <input
                      type="email"
                      placeholder="Correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow h-8 px-2 border rounded border-grey-400"
                    />
                  </div>
                  <div className="flex flex-col mt-4">
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-grow h-8 px-2 rounded border border-grey-40"
                    />
                  </div>
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      name="remember"
                      id="remember"
                      className="mr-2"
                    ></input>{" "}
                    <label htmlFor="remember" className="text-sm text-grey-dark">
                      Remember Me
                    </label>
                  </div>
                  {error && <p className="text-red-500">{error}</p>}
                  <div className="flex flex-col mt-8">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded"
                    >
                      Iniciar sesión
                    </button>
                  </div>
                </form>
                <div className="text-center mt-4">
                  <a
                    className="no-underline hover:underline text-blue-dark text-xs"
                    href="#"
                  >
                    Forgot Your Password?
                  </a>
                </div>
              </div>
              
            </div>
            
          </div>
          <div className="hidden md:block md:w-1/2 rounded-r-lg">
      <img
      src="src/img/logo/LOGO_MI_CONJUNTO.png"
      className=""
      alt="Logo"
      />
    </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
