import {useState, useEffect, useRef} from "react";
import {db, auth} from "./firebaseConfig"; // Importa la configuración de Firebase
import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    updateDoc,
} from "firebase/firestore"; // Para Firestore
import NotificacionesDueño from "./vistas/notificacionesDueño";
import {
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
} from "firebase/auth"; // Para Authentication

import Inquilinos from "./vistas/inquilinos";
import Apartamentos from "./vistas/apartamentos";
import Contratos from "./vistas/contratos";
import EstadoPagos from "./vistas/estadoPagos";
import Ingresos from "./vistas/ingresos";
import Historial from "./vistas/historial";
import PagosTotales from "./vistas/pagosTotales";

const PanelDueño = () => {
    const [inquilinos, setInquilinos] = useState([]);
    const [nuevoInquilino, setNuevoInquilino] = useState({
        nombre: "",
        email: "",
        password: "",
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editandoInquilino, setEditandoInquilino] = useState(null); // Para editar

    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Nuevo estado para el sidebar
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar el menú desplegable
    const dropdownRef = useRef(null); // Referencia al menú desplegable

    const toggleDropdown = () => {
        // Cierra el sidebar si está abierto al abrir el dropdown
        if (isSidebarOpen) setIsSidebarOpen(false);

        setIsDropdownOpen(!isDropdownOpen); // Alterna entre mostrar y ocultar el menú
    };

    const toggleSidebar = () => {
        console.log("toggleSidebar called");
        setIsSidebarOpen(!isSidebarOpen);
    };


    // Cargar inquilinos desde Firestore al montar el componente
    useEffect(() => {
        const cargarInquilinos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const inquilinosFirestore = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setInquilinos(inquilinosFirestore);
            } catch (error) {
                console.error("Error al cargar los inquilinos:", error);
            }
        };

        cargarInquilinos();
    }, []);

    // Estado para controlar la vista activa
    const [vistaActiva, setVistaActiva] = useState("inquilinos");

    // Añadir un nuevo inquilino
    const añadirInquilino = async () => {
        if (
            !nuevoInquilino.nombre ||
            !nuevoInquilino.email ||
            !nuevoInquilino.password
        ) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nuevoInquilino.email)) {
            alert("Por favor, ingresa un correo válido.");
            return;
        }

        // Validar longitud de la contraseña
        if (nuevoInquilino.password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const nuevoRegistro = {
            nombre: nuevoInquilino.nombre,
            email: nuevoInquilino.email,
            rol: "inquilino", // El rol se establece automáticamente
        };

        try {
            // Crear usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                nuevoInquilino.email,
                nuevoInquilino.password
            );

            const userUID = userCredential.user.uid;

            // Guardar datos adicionales en Firestore
            await setDoc(doc(db, "users", userUID), nuevoRegistro);

            // Actualizar el estado local
            setInquilinos([...inquilinos, {id: userUID, ...nuevoRegistro}]);
            setNuevoInquilino({nombre: "", email: "", password: ""}); // Limpiar el formulario
            setMostrarFormulario(false);
        } catch (error) {
            console.error("Error al añadir el inquilino:", error);
            if (error.code === "auth/email-already-in-use") {
                alert("El correo electrónico ya está en uso. Por favor, utiliza otro.");
            } else if (error.code === "auth/invalid-email") {
                alert("El correo electrónico no es válido.");
            } else if (error.code === "auth/weak-password") {
                alert(
                    "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
                );
            } else {
                alert("Hubo un error al guardar el inquilino. Inténtalo de nuevo.");
            }
        }
    };

    // Cerrar sesión
    const cerrarSesion = async () => {
        try {
            await signOut(auth); // Cierra la sesión del usuario actual
            alert("Sesión cerrada correctamente.");
            window.location.href = "/"; // Redirige al usuario a la página de inicio de sesión
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Hubo un error al cerrar la sesión.");
        }
    };

    // Eliminar un inquilino
    const eliminarInquilino = async (id, uid) => {
        try {
            await deleteDoc(doc(db, "users", id));
            setInquilinos(inquilinos.filter((inquilino) => inquilino.id !== id));

            const response = await fetch("http://localhost:5000/eliminarUsuario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({uid}),
            });

            if (response.ok) {
                alert("Inquilino eliminado correctamente.");
            } else {
                console.error(
                    "Error al eliminar el usuario de Authentication:",
                    await response.text()
                );
                alert(
                    "El inquilino fue eliminado de Firestore, pero no de Authentication."
                );
            }
        } catch (error) {
            console.error("Error al eliminar el inquilino:", error);
            alert("Hubo un error al eliminar el inquilino.");
        }
    };

    // Editar un inquilino
    const editarInquilino = async () => {
        if (editandoInquilino.nombre && editandoInquilino.email) {
            try {
                // 1. Actualizar en Firestore
                await updateDoc(doc(db, "users", editandoInquilino.id), {
                    nombre: editandoInquilino.nombre,
                    email: editandoInquilino.email,
                });

                // 2. Enviar solicitud al backend para actualizar en Firebase Authentication
                const response = await fetch("http://localhost:5000/editarUsuario", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: editandoInquilino.id,
                        email: editandoInquilino.email,
                    }),
                });

                if (response.ok) {
                    setInquilinos(
                        inquilinos.map((inquilino) =>
                            inquilino.id === editandoInquilino.id
                                ? editandoInquilino
                                : inquilino
                        )
                    );
                    setEditandoInquilino(null);
                    alert("Inquilino actualizado correctamente.");
                } else {
                    console.error(
                        "Error al editar el usuario de Authentication:",
                        await response.text()
                    );
                    alert(
                        "El inquilino fue actualizado en Firestore, pero no en Authentication."
                    );
                }
            } catch (error) {
                console.error("Error al editar el inquilino:", error);
                alert("Hubo un error al editar el inquilino.");
            }
        } else {
            alert("Por favor, completa todos los campos.");
        }
    };

    return (
        <div className="">


            <nav
                className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                onClick={toggleSidebar} // Llama a la función para alternar el sidebar
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" // Clases de Tailwind
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
                                            <div>Maria Jose Ramirez Cardona</div>
                                            {" "}
                                            {/* Nombre completo */}
                                            <div className="text-gray-500 break-words">
                                                maria.ramirez11@uceva.edu.co
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
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-18 transition-transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0`}>


                


                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">




                    <div className="mb-6 mt-10 text-center">
                        <p className="font-bold dark:text-white">Juan Sebastian Cadena Varela</p>
                        <p className="text-gray-600 dark:text-white">Dueño</p>
                    </div>


                    {/* Mostrar fecha actual */}
                    <div className="mt-6 mb-8 w-full">
                        <p className="text-center text-gray-700 font-medium dark:text-white uppercase">
                            {" "}
                            {new Date().toLocaleDateString("es-ES", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>






                    <ul className="space-y-2 font-medium">
                        <li>
                            <button
                                onClick={() => setVistaActiva("inquilinos")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "inquilinos" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >
                                <span className="ms-3">Inquilinos</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setVistaActiva("apartamentos")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "apartamentos" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >
                                <span className="ms-3">Apartamentos</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setVistaActiva("contratos")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "contratos" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >
                                <span className="ms-3">Contratos</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setVistaActiva("estadoPagos")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "estadoPagos" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >

                                <span className="ms-3">Zonas Comunes</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setVistaActiva("ingresos")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "ingresos" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >

                                <span className="ms-3">Ingresos</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setVistaActiva("historial")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "historial" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >

                                <span className="ms-3">Historial</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setVistaActiva("pagosTotales")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "pagosTotales" ? "bg-blue-800" : ""
                                } hover:bg-blue-200`}
                            >

                                <span className="ms-3">Pagos</span>
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => setVistaActiva("notificacionesDueño")}
                                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${
                                    vistaActiva === "notificacionesDueño"
                                        ? "bg-blue-200"
                                        : ""
                                } hover:bg-blue-200`}
                            >

                                <span className="ms-3">Notificaciones</span>
                            </button>
                        </li>
                        <li>

                            <button
                                onClick={cerrarSesion}
                                className="mt-auto bg-red-500 text-white py-2 px-4 rounded hover:bg-red-900 w-full"
                            >

                                <span className="ms-3">Cerrar sesión</span>
                            </button>
                        </li>

                    </ul>
                </div>


            </aside>


            {/* Contenido principal */}
            <main className="p-4 md:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-300 mt-14">

                    {/* Vista activa */}
                    {vistaActiva === "inquilinos" && (
                        <Inquilinos
                            inquilinos={inquilinos}
                            setEditandoInquilino={setEditandoInquilino}
                            eliminarInquilino={eliminarInquilino}
                            mostrarFormulario={mostrarFormulario}
                            setMostrarFormulario={setMostrarFormulario}
                            editandoInquilino={editandoInquilino}
                            nuevoInquilino={nuevoInquilino}
                            setNuevoInquilino={setNuevoInquilino}
                            añadirInquilino={añadirInquilino}
                            editarInquilino={editarInquilino}
                        />
                    )}

                    {/* Aquí puedes agregar más componentes para las otras vistas */}
                    {vistaActiva === "apartamentos" && <Apartamentos/>}
                    {vistaActiva === "contratos" && <Contratos/>}
                    {vistaActiva === "estadoPagos" && <EstadoPagos/>}
                    {vistaActiva === "ingresos" && <Ingresos/>}
                    {vistaActiva === "historial" && <Historial/>}
                    {vistaActiva === "pagosTotales" && <PagosTotales/>}
                    {vistaActiva === "notificacionesDueño" && <NotificacionesDueño/>}


                </div>

            </main>


        </div>
    );
};

export default PanelDueño;
