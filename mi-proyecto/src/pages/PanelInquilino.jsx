import { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getContratos } from "../utils";
import { signOut } from "firebase/auth"; // Asegúrate de importar signOut
import Contrato from "./vistasInquilino/contrato"; // Importamos el componente Contrato
import EditarPerfil from "./vistasInquilino/editarPerfil"; // Importamos el componente EditarPerfil
import Pagos from "./vistasInquilino/pagos";
import { useNavigate } from "react-router-dom";// Importar useNavigate

const PanelInquilino = ({ userId }) => {
  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState("contrato"); // Estado para controlar la vista actual
  const [loading, setLoading] = useState(true); // Estado para indicar si la información está cargando
  const [hayPagosPendientes, setHayPagosPendientes] = useState(false);
  const [cantidadPagosPendientes, setCantidadPagosPendientes] = useState(0);
  
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      setLoading(true);
      try {
        const contratosData = await getContratos(userId);
        if (contratosData.length <= 0) return
        const contratoData = contratosData[0];
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1; // Sumamos 1 porque los meses van de 0 a 11
        const añoActual = fechaActual.getFullYear();
        const cobrosPendientes = contratoData.cobros.filter((cobro) => {
          const fechaVencimiento = cobro.fecha_vencimiento.toDate();
          const mesVencimiento = fechaVencimiento.getMonth() + 1;
          const añoVencimiento = fechaVencimiento.getFullYear();
          // Verificar si el cobro está vencido y no ha sido pagado, o si es el mes actual y no ha sido pagado
          return (
            ((fechaVencimiento < fechaActual && cobro.estado !== "Pagado")) ||
            (mesVencimiento === mesActual &&
              añoVencimiento === añoActual &&
              cobro.estado !== "Pagado")
          );
        });
        setCantidadPagosPendientes(cobrosPendientes.length);
        setHayPagosPendientes(cobrosPendientes.length > 0)
        const usuarioSnap = await getDoc(doc(db, "users", userId));

        if (usuarioSnap.exists()) {
          setUsuario(usuarioSnap.data());
        } else {
          console.error("No se encontro el documento del usuario.");
        }
        } catch (error) {
          console.error("Error al cargar los datos del usuario:", error);
        } finally{
          setLoading(false);
        }
    };
    if (userId) {
      cargarDatosUsuario();
    }
  }, [userId]);
    const navigate = useNavigate();
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
          {/* Mostrar mensaje de cobros pendientes */}
          {hayPagosPendientes ? (
            <div className="text-center">
             <p className="text-red-600 font-semibold mb-2">
                Tienes {cantidadPagosPendientes}
                {cantidadPagosPendientes === 1 ? " pago" : " pagos"} pendiente
                {cantidadPagosPendientes === 1 ? "" : "s"}.
             </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-2">No tienes pagos pendientes.</p>
            </div>
          )}

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