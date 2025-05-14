import { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getContratos } from "../utils";
import { signOut } from "firebase/auth"; // Asegúrate de importar signOut
import Contrato from "./vistasInquilino/contrato"; // Importamos el componente Contrato
import EditarPerfil from "./vistasInquilino/editarPerfil"; // Importamos el componente EditarPerfil
import Pagos from "./vistasInquilino/pagos";
import Notificaciones from "./vistasInquilino/notificaciones";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const PanelInquilino = ({ userId }) => {
  const getIconForCategory = (category) => {
    switch (category) {
      case "Pago":
        return "💰";
      case "Informacion":
        return "ℹ️";
      case "Mantenimiento":
        return "🛠️";
      case "Comunicado":
        return "📢";
      case "Otros":
        return "✨";
      default:
        return "";
    }
  };

  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState("contrato"); // Estado para controlar la vista actual
  const [loading, setLoading] = useState(true); // Estado para indicar si la información está cargando
  const [hayPagosPendientes, setHayPagosPendientes] = useState(false);
  const [cantidadPagosPendientes, setCantidadPagosPendientes] = useState(0);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState([]);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      setLoading(true);
      try {
        const contratosData = await getContratos(userId);
        if (contratosData.length <= 0) return;
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
            (fechaVencimiento < fechaActual && cobro.estado !== "Pagado") ||
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
          console.error("No se encontro el documento del usuario.");
        }

        // Cargar notificaciones no leídas
        const notificacionesQuery = query(
          collection(db, "notificaciones"),
          where("leido", "==", false),
          where("idDestinatario", "in", [userId, null])
        );

        const notificacionesSnap = await getDocs(notificacionesQuery);
        const notificaciones = notificacionesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotificacionesNoLeidas(notificaciones);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowNotificationsMenu(false);
      }
    };
    if (showNotificationsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationsMenu]);
  const navigate = useNavigate();
  const marcarTodasComoLeidas = async () => {
    try {
      for (const notificacion of notificacionesNoLeidas) {
        await updateDoc(doc(db, "notificaciones", notificacion.id), {
          leido: true,
        });
      }
      setNotificacionesNoLeidas([]);
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
    }
  };

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
        <div className="relative" ref={buttonRef}>
          <button
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
            className="mb-4 bg-blue-500 rounded-full p-2 relative"
          >
            <svg
              className="w-5 h-5 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 14 20"
            >
              <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
            </svg>
            {notificacionesNoLeidas.length > 0 && (
              <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900">
                <span className="absolute -top-1 start-1 text-[10px] text-white">
                  {notificacionesNoLeidas.length}
                </span>
              </div>
            )}
          </button>
          {showNotificationsMenu && (
            <div
              className="z-20 absolute top-10 left-1/2 -translate-x-1/2 w-[350px] bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700 max-h-[400px]"
              ref={menuRef}
            >
              <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
                Notifications
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[300px] overflow-y-auto">
                {notificacionesNoLeidas.length > 0 ? (
                  notificacionesNoLeidas.map((notificacion) => (
                    <a
                      href="#"
                      key={notificacion.id}
                      className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="w-full ps-3">
                        <div className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                          <span className="mr-1">
                            {getIconForCategory(notificacion.categoria)}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {notificacion.titulo}
                          </span>
                          : {notificacion.mensaje}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">
                          Hace poco
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <a
                    href="#"
                    className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="w-full ps-3">No tienes notificaciones</div>
                  </a>
                )}
              </div>
              <a
                onClick={marcarTodasComoLeidas}
                className="block py-2 text-sm font-medium text-center text-gray-900 rounded-b-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
              >
                <div className="inline-flex items-center ">
                  Marcar como leido
                </div>
              </a>
            </div>
          )}
        </div>

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
              <p className="text-green-600 font-semibold mb-2">
                No tienes pagos pendientes.
              </p>
            </div>
          )}

          <p className="text-gray-600">
            {usuario?.nombre || "Nombre no disponible"}
          </p>
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
            onClick={() => setView("notificaciones")}
            className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200"
          >
            Notificaciones
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
        {view === "pagos" && <Pagos userId={userId} />}
        {view === "notificaciones" && <Notificaciones userId={userId} />}
      </main>
    </div>
  );
};

export default PanelInquilino;
