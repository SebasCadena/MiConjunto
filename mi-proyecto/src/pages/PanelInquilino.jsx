import { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getContratos } from "../utils";
import { signOut } from "firebase/auth";
import Contrato from "./vistasInquilino/contrato";
import EditarPerfil from "./vistasInquilino/editarPerfil";
import Pagos from "./vistasInquilino/pagos";
import { useNavigate } from "react-router-dom";

const PanelInquilino = ({ userId }) => {
  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState("contrato");
  const [loading, setLoading] = useState(true);
  const [hayPagosPendientes, setHayPagosPendientes] = useState(false);
  const [cantidadPagosPendientes, setCantidadPagosPendientes] = useState(0);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      setLoading(true);
      try {
        const contratosData = await getContratos(userId);
        if (contratosData.length <= 0) return;
        const contratoData = contratosData[0];
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1;
        const añoActual = fechaActual.getFullYear();
        const cobrosPendientes = contratoData.cobros.filter((cobro) => {
          const fechaVencimiento = cobro.fecha_vencimiento.toDate();
          const mesVencimiento = fechaVencimiento.getMonth() + 1;
          const añoVencimiento = fechaVencimiento.getFullYear();
          return (
            ((fechaVencimiento < fechaActual && cobro.estado !== "Pagado")) ||
            (mesVencimiento === mesActual &&
              añoVencimiento === añoActual &&
              cobro.estado !== "Pagado")
          );
        });
        setCantidadPagosPendientes(cobrosPendientes.length);
        setHayPagosPendientes(cobrosPendientes.length > 0);
        const usuarioSnap = await getDoc(doc(db, "users", userId));

        if (usuarioSnap.exists()) {
          setUsuario(usuarioSnap.data());
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
    <div>
      {/* Barra de navegación superior */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
              <a href="#" className="flex ml-2 md:mr-24">
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="h-8 mr-3"
                  alt="Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                  Mi Conjunto
                </span>
              </a>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ml-3">
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                    alt="user photo"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú lateral */}
      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <button
                onClick={() => setView("contrato")}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                Contrato
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("editarPerfil")}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                Editar Perfil
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("pagos")}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                Pagos
              </button>
            </li>
            <li>
              <button
                onClick={cerrarSesion}
                className="flex items-center p-2 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 group"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          {view === "contrato" && <Contrato userId={userId} />}
          {view === "editarPerfil" && <EditarPerfil userId={userId} />}
          {view === "pagos" && <Pagos userId={userId} />}
        </div>
      </div>
    </div>
  );
};

export default PanelInquilino;