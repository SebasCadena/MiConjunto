import { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Contrato from "./vistasInquilino/contrato"; // Importamos el componente Contrato
import EditarPerfil from "./vistasInquilino/editarPerfil"; // Importamos el componente EditarPerfil
import Pagos from "./vistasInquilino/pagos";

const PanelInquilino = ({ userId }) => {
  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState("contrato"); // Estado para controlar la vista actual
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        console.log("Cargando datos para el usuario:", userId);

        // Obtener datos del usuario
        const usuarioRef = doc(db, "users", userId);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const usuarioData = usuarioSnap.data();
          setUsuario(usuarioData);
          console.log("Usuario encontrado:", usuarioData);
        } else {
          console.error("No se encontró el documento del usuario.");
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      cargarDatosUsuario();
    }
  }, [userId]);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      alert("Sesión cerrada correctamente.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un error al cerrar la sesión.");
    }
  };

  if (loading) {
    return <p>Cargando información del usuario...</p>;
  }

  return (
    <div className="flex h-screen bg-teal-50">
      {/* Barra lateral */}
        <aside className="w-1/4 bg-teal-100 p-6 flex flex-col items-center">
          <div className="mb-6 text-center">
            <div className="w-24 h-24 bg-blue-500 rounded-full mb-4 mx-auto"></div>
            <h2 className="font-bold text-lg">Mi Conjunto</h2>
            <p className="text-gray-600">{usuario?.nombre || "Nombre no disponible"}</p>
          </div>
          <nav className="flex flex-col space-y-4 w-full">
            <button
              onClick={() => setView("contrato")}
              className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200"
            >
              Contrato
            </button>
            <button
              onClick={() => setView("editarPerfil")}
              className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200"
            >
              Editar Perfil
            </button>
            <button
              onClick={() => setView("pagos")}
              className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200"
            >
              Pagos
            </button>
            <button
              onClick={cerrarSesion}
              className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </nav>
        </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        {view === "contrato" && <Contrato userId={userId} />}
        {view === "editarPerfil" && <EditarPerfil userId={userId} />}
        {view === "pagos" && <Pagos userId={userId} />} {/* Renderizar Pagos */}
      </main>
    </div>
  );
};

export default PanelInquilino;