import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { crearNotificacion } from "../../utils"; // Importar crearNotificacion
import { getAuth } from "firebase/auth";

const NotificacionesDueño = () => {
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idDestinatario, setIdDestinatario] = useState("");
  const [inquilinos, setInquilinos] = useState([]);
  
    useEffect(() => {
        const cargarInquilinos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                console.log("Documentos de usuarios obtenidos:", querySnapshot.docs);
                const inquilinosData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    nombre: doc.data().nombre,
                    rol: doc.data().rol,
                })).filter((inquilino) => inquilino.rol === "inquilino");
                console.log("Inquilinos cargados y filtrados:", inquilinosData);
                setInquilinos(inquilinosData);
            } catch (error) {
                console.error("Error al cargar los inquilinos:", error);
            }
        };

        cargarInquilinos();
    }, []);

    const handleSubmit = async (event) => {
      event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
      if (!titulo || !mensaje || prioridad === "" || categoria === "" || idDestinatario === "") {
          alert("Por favor, completa todos los campos obligatorios.");
          
          
          return;
      }
  
      // Si la validación pasa, se ejecuta el resto del código
      const notificacionData = {
        idDestinatario: idDestinatario,
        titulo: titulo,
        mensaje: mensaje,
        prioridad: prioridad,
        categoria: categoria,
      };
        try {
            await crearNotificacion(notificacionData); // Llamar a crearNotificacion
            alert("Notificación creada correctamente.");
    
            // Reiniciar los estados del formulario
            setTitulo("");
            setMensaje("");
            setPrioridad("");
            setCategoria("");
            setIdDestinatario("");
        } catch (error) {
            console.error("Error al crear la notificación:", error);
            alert("Ocurrió un error al crear la notificación.");
        }

      };

    return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Notificaciones</h1>

      {/* Formulario */}
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
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
            {inquilinos.map((inquilino) =>(
              <option key={inquilino.id} value={inquilino.id}>
                {inquilino.nombre}
              </option>
            ))}

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
    </div>
  );
};

export default NotificacionesDueño;