import {useState, useEffect, useRef} from "react";
import {db, auth} from "./firebaseConfig";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
} from "firebase/firestore";
import {getContratos} from "../utils";
import {signOut} from "firebase/auth"; // Asegúrate de importar signOut
import Contrato from "./vistasInquilino/contrato"; // Importamos el componente Contrato
import EditarPerfil from "./vistasInquilino/editarPerfil"; // Importamos el componente EditarPerfil
import Pagos from "./vistasInquilino/pagos";
import Notificaciones from "./vistasInquilino/notificaciones";
import {useNavigate} from "react-router-dom"; // Importar useNavigate

const PanelInquilino = ({userId}) => {
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Nuevo estado para el sidebar

    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar el menú desplegable
    const dropdownRef = useRef(null); // Referencia al menú desplegable

    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const asideRef = useRef(null);

    const toggleDropdown = () => {
        // Cierra el sidebar si está abierto al abrir el dropdown
        if (isSidebarOpen) setIsSidebarOpen(false);

        setIsDropdownOpen(!isDropdownOpen); // Alterna entre mostrar y ocultar el menú
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false); // Cierra el menú si se hace clic fuera de él
        }
    };

    // Función para alternar la visibilidad del sidebar
    const toggleSidebar = () => {
        console.log("toggleSidebar called");
        setIsSidebarOpen(!isSidebarOpen);
    };

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Si el aside está abierto y el clic fue fuera del aside y no fue en el botón de toggle
            if (
                isSidebarOpen &&
                asideRef.current &&
                !asideRef.current.contains(event.target) &&
                !event.target.closest('button[type="button"]') // Evita cerrar cuando se hace clic en el botón de toggle
            ) {
                setIsSidebarOpen(false);
            }
        };

        // Solo agregar el event listener si el sidebar está abierto
        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Cierra el sidebar cuando el tamaño de la pantalla es mayor que 'sm'
        const handleResize = () => {
            if (window.innerWidth >= 640 && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isSidebarOpen]);

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
            <nav
                className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                onClick={toggleSidebar} // Llama a la función para alternar el sidebar
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" // Clases de Tailwind
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
                                    src="src/img/logo/LOGO_MI_CONJUNTO.png"
                                    className="h-12 mr-3"
                                    alt="Logo"
                                />
                                <span
                                    className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                  Mi Conjunto
                </span>
                            </a>
                        </div>

                        <div className="flex items-center content-center">
                            <div className="flex items-center ms-3">
                                <div className="flex mr-5 w-10 h-10" ref={buttonRef}>
                                    <button
                                        onClick={() =>
                                            setShowNotificationsMenu(!showNotificationsMenu)
                                        }
                                        className="rounded-full p-2 relative cursor-pointer"
                                    >
                                        <svg
                                            className="w-5 h-5 text-white"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 14 20"
                                        >
                                            <path
                                                d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z"/>
                                        </svg>
                                        {notificacionesNoLeidas.length > 0 && (
                                            <div
                                                className="absolute block w-3 h-3 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900">
                        <span className="absolute -top-1 start-1 text-[10px] text-white">
                          {notificacionesNoLeidas.length}
                        </span>
                                            </div>
                                        )}
                                    </button>
                                    {showNotificationsMenu && (
                                        <div
                                            className="z-20 absolute top-20 left-1/2 -translate-x-1/2 w-[350px] bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700 max-h-[400px]"
                                            ref={menuRef}
                                        >
                                            <div
                                                className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
                                                Notifications
                                            </div>
                                            <div
                                                className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[300px] overflow-y-auto dark:text-white">
                                                {notificacionesNoLeidas.length > 0 ? (
                                                    notificacionesNoLeidas.map((notificacion) => (
                                                        <a
                                                            href="#"
                                                            key={notificacion.id}
                                                            className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <div className="w-full ps-3">
                                                                <div
                                                                    className="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                                  <span className="mr-1">
                                    {getIconForCategory(notificacion.categoria)}
                                  </span>
                                                                    <span
                                                                        className="font-semibold text-gray-900 dark:text-white">
                                    {notificacion.titulo}
                                  </span>
                                                                    : {notificacion.mensaje}
                                                                </div>
                                                                <div
                                                                    className="text-xs text-blue-600 dark:text-blue-500">
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
                                                        <div className="w-full ps-3">
                                                            No tienes notificaciones
                                                        </div>
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

                                <img
                                    id="avatarButton"
                                    type="button"
                                    onClick={toggleDropdown} // Controla la visibilidad del menú
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                    alt="User dropdown"
                                />

                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <div
                                        id="userDropdown"
                                        ref={dropdownRef} // Asigna la referencia al menú desplegable
                                        className="absolute right-0 top-20 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-64" // Cambié mt-2 a top-12 para posicionar correctamente
                                    >
                                        <div className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            <div>
                                            {usuario ? usuario.nombre : "Cargando..."}
                                            </div>
                                            {" "}
                                            {/* Nombre completo */}
                                            <div className="mt-2 text-gray-500 break-words">
                                            {usuario ? usuario.email : "Cargando..."}
                                            </div>
                                            {" "}
                                            {/* Correo en una línea separada */}
                                        </div>
                                        <ul className="py-2 space-y-1 font-medium text-gray-900">
                                            <li>
                                                <button
                                                    className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100">
                                                    <svg
                                                        className="w-5 h-5 text-gray-500 shrink-0"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                                                    </svg>
                                                    <span className="ml-3">Settings</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100">
                                                    <svg
                                                        className="w-5 h-5 text-gray-500 shrink-0"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                                                    </svg>
                                                    <span className="ml-3">Earnings</span>
                                                </button>
                                            </li>
                                        </ul>
                                        <div className="py-1">
                                            <button
                                                className="flex items-center w-full px-4 py-2 text-left text-red-600 rounded-lg hover:bg-gray-100"
                                                onClick={cerrarSesion}
                                            >
                                                <svg
                                                    className="w-5 h-5 text-red-600 shrink-0"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        d="M10.293 15.707a1 1 0 010-1.414L12.586 12H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                                                    <path
                                                        d="M20 3H10a1 1 0 100 2h10v14H10a1 1 0 100 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                                                </svg>
                                                <span className="ml-3">Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Barra lateral */}
            <aside
                ref={asideRef}
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-18 transition-transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0`}
            >
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <div className="text-center p-3 mt-5 mb-10">
                                {/* Mostrar mensaje de cobros pendientes */}
                                {hayPagosPendientes ? (
                                    <div className="text-center">
                                        <p className="text-red-600 font-semibold mb-2">
                                            Tienes {cantidadPagosPendientes}
                                            {cantidadPagosPendientes === 1 ? " pago" : " pagos"}{" "}
                                            pendiente
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

                                <p className="dark:text-white font-bold font-big text-xl">
                                    {usuario?.nombre || "Nombre no disponible"}
                                </p>
                            </div>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setView("contrato");
                                    toggleSidebar(); // Cerrar el sidebar
                                }}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full"
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 22 21"
                                >
                                    <path
                                        d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                                    <path
                                        d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                                </svg>
                                <span className="ms-3">Contrato</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setView("editarPerfil");
                                    toggleSidebar(); // Cerrar el sidebar
                                }}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full"
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 18 18"
                                >
                                    <path
                                        d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                                </svg>
                                <span className="ms-3">Editar Perfil</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setView("pagos");
                                    toggleSidebar(); // Cerrar el sidebar
                                }}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full"
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 18"
                                >
                                    <path
                                        d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                                </svg>
                                <span className="ms-3">Pagos</span>
                            </button>
                        </li>
                        <li>
                            <a
                                onClick={() => {
                                    setView("notificaciones");
                                    toggleSidebar(); // Cerrar el sidebar
                                }}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">
                  Notificaciones
                </span>
                                <span
                                    className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  3
                </span>
                            </a>
                        </li>

                        <li>
                            <button
                                onClick={cerrarSesion}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full"
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 18 16"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                                    />
                                </svg>
                                <span className="ms-3">Cerrar Sesión</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-300 mt-14">
                    {view === "contrato" && <Contrato userId={userId}/>}
                    {view === "editarPerfil" && <EditarPerfil userId={userId}/>}
                    {view === "pagos" && <Pagos userId={userId}/>}
                    {view === "notificaciones" && <Notificaciones userId={userId}/>}
                </div>
            </div>
        </div>
    );
};

export default PanelInquilino;
