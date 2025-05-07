import { useState, useEffect, useRef } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar el menú desplegable
  const dropdownRef = useRef(null); // Referencia al menú desplegable

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Alterna entre mostrar y ocultar el menú
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false); // Cierra el menú si se hace clic fuera de él
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      setLoading(true);
      try {
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
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                  Mi Conjunto
                </span>
              </a>
            </div>
            <div className="flex items-center relative">
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
                  className="absolute right-0 top-12 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-64" // Cambié mt-2 a top-12 para posicionar correctamente
                >
                  <div className="px-4 py-3 text-sm text-gray-900 font-medium">
                    <div>Maria Jose Ramirez Cardona</div> {/* Nombre completo */}
                    <div className="text-gray-500 break-words">maria.ramirez11@uceva.edu.co</div> {/* Correo en una línea separada */}
                  </div>
                  <ul className="py-2 space-y-1 font-medium text-gray-900">
                    <li>
                      <button
                        className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                        </svg>
                        <span className="ml-3">Settings</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
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
                          d="M10.293 15.707a1 1 0 010-1.414L12.586 12H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        />
                        <path
                          d="M20 3H10a1 1 0 100 2h10v14H10a1 1 0 100 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"
                        />
                      </svg>
                      <span className="ml-3">Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menú lateral */}
      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            <li>
              <button
                onClick={() => setView("contrato")}
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group w-full"
              >
                <svg
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Contrato</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("editarPerfil")}
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group w-full"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>
                <span className="ms-3">Editar Perfil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("pagos")}
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group w-full"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="ms-3">Pagos</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("inbox")}
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group w-full"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Inbox</span>
                <span className="inline-flex items-center justify-center w-5 h-5 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                  3
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={cerrarSesion}
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group w-full"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
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
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg mt-14">
          {view === "contrato" && <Contrato userId={userId} />}
          {view === "editarPerfil" && <EditarPerfil userId={userId} />}
          {view === "pagos" && <Pagos userId={userId} />}
        </div>
      </div>
    </div>
  );
};

export default PanelInquilino;