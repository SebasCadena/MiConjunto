import React, {useState, useEffect} from "react";
import {collection, getDocs, query, orderBy} from "firebase/firestore";
import {db} from "../firebaseConfig";
import emailjs from '@emailjs/browser';
import {crearNotificacion} from "../../utils";


const NotificacionesDueño = () => {


    const [titulo, setTitulo] = useState("");
    const [notificaciones, setNotificaciones] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [prioridad, setPrioridad] = useState("");
    const [filtroPrioridad, setFiltroPrioridad] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroDestinatario, setFiltroDestinatario] = useState("");
    const [categoria, setCategoria] = useState("");
    const [idDestinatario, setIdDestinatario] = useState("");
    const [inquilinos, setInquilinos] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);


    useEffect(() => {
        const cargarInquilinos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const inquilinosData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    nombre: doc.data().nombre,
                    email: doc.data().email,
                    activo: doc.data().activo,
                    rol: doc.data().rol,
                })).filter((inquilino) => inquilino.rol === "inquilino");
                setInquilinos(inquilinosData);
            } catch (error) {
                console.error("Error al cargar los inquilinos:", error);
            }
        };
        const cargarNotificaciones = async () => {
            try {
                const notificacionesCollection = collection(db, "notificaciones");
                const q = query(notificacionesCollection, orderBy('fecha', 'desc'));
                const querySnapshot = await getDocs(q);

                const notificacionesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setNotificaciones(notificacionesData);
            } catch (error) {
                console.error("Error al cargar las notificaciones:", error);
            }
        };

        cargarInquilinos();
        cargarNotificaciones();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Validacion de campos obligatorios
        if (!titulo || !mensaje || prioridad === "" || categoria === "" || idDestinatario === "") {
            alert("Por favor, completa todos los campos obligatorios.");
            return; // Detiene la ejecucion aqui si la validacion falla
        }

        // Si la validacion pasa, la ejecucion continua aqui
        try {
            if (idDestinatario === null) {
                // Crear notificaciones para cada inquilino activo
                const inquilinosActivos = inquilinos.filter(inquilino => inquilino.activo === true);
                const notificacionesPromises = inquilinosActivos.map(inquilino => {
                    const notificacionData = {
                        idDestinatario: inquilino.id,
                        titulo: titulo,
                        mensaje: mensaje,
                        prioridad: prioridad,
                        categoria: categoria,
                        leido: false,
                    };
                    return crearNotificacion(notificacionData); // Llamar a crearNotificacion para cada inquilino
                });
                await Promise.all(notificacionesPromises); // Esperar a que todas las notificaciones se creen
            } else {
                // Crear una notificación individual para el inquilino seleccionado
                const notificacionData = {
                    idDestinatario: idDestinatario,
                    titulo: titulo,
                    mensaje: mensaje,
                    prioridad: prioridad,
                    categoria: categoria,
                };
                await crearNotificacion(notificacionData);

                // Encontrar el email del inquilino
                const inquilino = inquilinos.find(i => i.id === idDestinatario);
                if (inquilino && inquilino.email) {
                    const toEmail = inquilino.email;

                    // Enviar correo con emailjs
                    const templateParams = {
                        to_email: toEmail,
                        titulo: titulo,
                        mensaje: mensaje,
                        categoria: categoria,
                        prioridad: prioridad,
                    };
                    console.log('Sending email with params:', templateParams);

                    emailjs.send(
                        'service_7n1h9xn', // Your Service ID
                        'template_nwa3h8e', // Your Template ID
                        templateParams,
                        'VkLV1s9U7qcNQGxWf' // Your Public Key
                    )
                        .then((response) => {
                            console.log('Correo enviado exitosamente!', response.status, response.text);
                            alert("Correo enviado correctamente.");
                        }, (error) => {
                            console.error('Error al enviar el correo:', error);
                            alert("Ocurrió un error al enviar el correo.");
                        });
                } else {
                    console.error("No se encontró el email del inquilino.");
                }
            }

            alert("Notificacion creada correctamente.");
            setTitulo("");
            setMensaje("");
            setPrioridad("");
            setCategoria("");
            setIdDestinatario("");
            setMostrarFormulario(false);
        } catch (error) {
            console.error("Error al crear la notificación:", error);
            alert("Ocurrió un error al crear la notificación.");
        }

    };
    const notificacionesFiltradas = notificaciones.filter(notificacion => {
        const prioridadMatch = filtroPrioridad === "" || notificacion.prioridad === filtroPrioridad;
        const categoriaMatch = filtroCategoria === "" || notificacion.categoria === filtroCategoria;
        const destinatarioMatch = filtroDestinatario === "" ||
            (filtroDestinatario === "General" && notificacion.idDestinatario === null) ||
            (notificacion.idDestinatario === filtroDestinatario);

        return prioridadMatch && categoriaMatch && destinatarioMatch;
    });


    return (
        <div className="p-2">
            <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Crear
                Nueva Notificación
            </button>

            {mostrarFormulario && (
                <>
                    <h1 className="text-2xl font-bold mb-6">Gestión de Notificaciones</h1>
                    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        {/* Formulario */}
                        {/* Título */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
                                Título
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="titulo"
                                type="text"
                                placeholder="Título de la notificación"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>

                        {/* Mensaje */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mensaje">
                                Mensaje
                            </label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
                                id="mensaje"
                                placeholder="Contenido del mensaje"
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                            />
                        </div>

                        {/* Prioridad */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prioridad">
                                Prioridad
                            </label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="prioridad"
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                            >
                                <option value="">Seleccione prioridad</option>
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                        </div>

                        {/* Categoría */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoria">
                                Categoría
                            </label>
                            <select
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="categoria"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="Pago">Pago</option>
                                <option value="Informacion">Información</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Comunicado">Comunicado</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        {/* Destinatario */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destinatario">
                                Destinatario
                            </label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="destinatario"
                                value={idDestinatario}
                                onChange={(e) => setIdDestinatario(e.target.value === "" ? null : e.target.value)}
                            >
                                <option value="">Seleccione destinatario</option>
                                <option value="">General</option>
                                {/* Añadimos esta línea */}
                                {inquilinos.map((inquilino) => (
                                    <option key={inquilino.id} value={inquilino.id}>
                                        {inquilino.nombre}
                                    </option>
                                ))}

                            </select>
                        </div>

                        {/* Botón */}
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >

                                Crear Notificación
                            </button>
                        </div>
                    </form>
                </>
            )}
            {/* Controles de Filtrado */}
            <div className="mt-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Filtro por Prioridad */}
                    <div className="flex flex-col">
                        <label
                            className="text-sm font-medium text-gray-700 mb-2"
                            htmlFor="filtroPrioridad"
                        >
                            Filtrar por Prioridad
                        </label>
                        <div className="relative">
                            <select
                                id="filtroPrioridad"
                                className="w-full px-3 py-2 text-sm border border-gray-300
                             rounded-md shadow-sm appearance-none bg-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500"
                                value={filtroPrioridad}
                                onChange={(e) => setFiltroPrioridad(e.target.value)}
                            >
                                <option value="">Todas las prioridades</option>
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filtro por Categoría */}
                    <div className="flex flex-col">
                        <label
                            className="text-sm font-medium text-gray-700 mb-2"
                            htmlFor="filtroCategoria"
                        >
                            Filtrar por Categoría
                        </label>
                        <div className="relative">
                            <select
                                id="filtroCategoria"
                                className="w-full px-3 py-2 text-sm border border-gray-300
                             rounded-md shadow-sm appearance-none bg-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500"
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                            >
                                <option value="">Todas las categorías</option>
                                <option value="Pago">Pago</option>
                                <option value="Informacion">Información</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Comunicado">Comunicado</option>
                                <option value="Otros">Otros</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filtro por Destinatario */}
                    <div className="flex flex-col">
                        <label
                            className="text-sm font-medium text-gray-700 mb-2"
                            htmlFor="filtroDestinatario"
                        >
                            Filtrar por Destinatario
                        </label>
                        <div className="relative">
                            <select
                                id="filtroDestinatario"
                                className="w-full px-3 py-2 text-sm border border-gray-300
                             rounded-md shadow-sm appearance-none bg-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500"
                                value={filtroDestinatario}
                                onChange={(e) => setFiltroDestinatario(e.target.value)}
                            >
                                <option value="">Todos los destinatarios</option>
                                <option value="General">General</option>
                                {inquilinos.map((inquilino) => (
                                    <option key={inquilino.id} value={inquilino.id}>
                                        {inquilino.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Tabla de Notificaciones */}

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Listado de Notificaciones</h2>

                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Título
                            </th>
                            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Mensaje
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Prioridad
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Categoría
                            </th>
                            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Destinatario
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {notificacionesFiltradas.map((notificacion) => (
                            <>
                                <tr key={notificacion.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm text-gray-900">
                                        <span className="font-medium">{notificacion.titulo}</span>
                                    </td>
                                    <td className="hidden sm:table-cell px-4 py-4 text-sm text-gray-500">
                                        {notificacion.mensaje}
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                    ${notificacion.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                                    notificacion.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'}`}>
                                    {notificacion.prioridad}
                                </span>
                                    </td>
                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                    {notificacion.categoria}
                                </span>
                                    </td>
                                    <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-500">
                                        {notificacion.idDestinatario ?
                                            inquilinos.find(i => i.id === notificacion.idDestinatario)?.nombre ||
                                            "Inquilino no encontrado" :
                                            "General"}
                                    </td>
                                </tr>
                                {/* Vista móvil para información oculta */}
                                <tr className="sm:hidden bg-gray-50">
                                    <td colSpan="5" className="px-4 py-3">
                                        <div className="text-sm text-gray-500 space-y-2">
                                            <p className="font-medium text-gray-900">Mensaje:</p>
                                            <p className="mb-2">{notificacion.mensaje}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="font-medium text-gray-900">Categoría:</span>
                                                    <p>{notificacion.categoria}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900">Destinatario:</span>
                                                    <p>{notificacion.idDestinatario ?
                                                        inquilinos.find(i => i.id === notificacion.idDestinatario)?.nombre ||
                                                        "Inquilino no encontrado" :
                                                        "General"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </>
                        ))}
                        </tbody>
                    </table>
                </div>

                {notificacionesFiltradas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron notificaciones que coincidan con los filtros seleccionados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificacionesDueño;