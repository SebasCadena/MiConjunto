import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { crearNotificacion } from "../../utils";


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
    <div className="p-6">
      <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Crear Nueva Notificación</button>

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
            <option value="">General</option> {/* Añadimos esta línea */}
            {inquilinos.map((inquilino) =>(
              <option key={inquilino.id} value={inquilino.id}>
                {inquilino.nombre}
              </option>
            )) }

          </select>
        </div>

        {/* Botón */}
        <div className="flex items-center justify-between">
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit"
          >

            Crear Notificación
          </button>
        </div>
        </form>
      </>
      )}
      {/* Controles de Filtrado */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div >
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filtroPrioridad">Filtrar por Prioridad:</label>
          <select
            id="filtroPrioridad"
            className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div >
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filtroCategoria">Filtrar por Categoría:</label>
          <select
            id="filtroCategoria"
            className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Pago">Pago</option>
            <option value="Informacion">Información</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Comunicado">Comunicado</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
          <div >
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filtroDestinatario">Filtrar por Destinatario:</label>
            <select id="filtroDestinatario" className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={filtroDestinatario} onChange={(e) => setFiltroDestinatario(e.target.value)}>
            <option value="">Todos</option>
            <option value="General">General</option> {/* Opcion para destinatario general */}
            {inquilinos.map((inquilino) => (
              <option key={inquilino.id} value={inquilino.id}>
                {inquilino.nombre}
              </option>
            ))}
          </select>
        </div>

      </div>
      {/* Tabla de Notificaciones */}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Listado de Notificaciones</h2>
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Mensaje</th>
              <th className="px-4 py-2">Prioridad</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Destinatario</th>
            </tr>
          </thead>
          <tbody>
            {notificacionesFiltradas.map((notificacion) => (
              <tr key={notificacion.id} className="border-b border-gray-200">
                <td className="px-4 py-2">{notificacion.titulo}</td>
                <td className="px-4 py-2">{notificacion.mensaje}</td>
                <td className="px-4 py-2">{notificacion.prioridad}</td>
                <td className="px-4 py-2">{notificacion.categoria}</td>             
                <td className="px-4 py-2">{notificacion.idDestinatario ? inquilinos.find(i => i.id === notificacion.idDestinatario)?.nombre || "Inquilino no encontrado" : "General"}</td>      
              </tr>
            ))}
          </tbody></table>
      </div>
    </div>
  );
};

export default NotificacionesDueño;