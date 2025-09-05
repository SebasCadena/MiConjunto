import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Notificaciones = ({ userId }) => {
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Pago":{
        return {
          classes: "bg-green-100 text-green-800",
          icon: "💰",
        };
      }
      case "Informacion":{
        return {
          classes: "bg-blue-100 text-blue-800",
          icon: "ℹ️",
        };
      }
      case "Mantenimiento":{
        return {
          classes: "bg-yellow-100 text-yellow-800",
          icon: "🛠️",
        };
      }
      case "Comunicado":{
        return {
          classes: "bg-purple-100 text-purple-800",
          icon: "📢",
        };
      }
      default:
        return { classes: "bg-gray-100 text-gray-800", icon: "✨" };
    }
  };




  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarNotificacionesInquilino = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const notificacionesCollection = collection(db, "notificaciones");
        
        const q = query(
          notificacionesCollection,
          where("idDestinatario", "in", [userId, null]), // Filtra por el ID del usuario o null
        );//eliminamos orderBy

        const querySnapshot = await getDocs(q);

        const notificacionesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotificaciones(notificacionesData);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las notificaciones:", err);
        setError("Error al cargar las notificaciones.");
        setLoading(false);
      }
    };

    cargarNotificacionesInquilino();
  }, [userId]);

  if (loading) {
    return <p>Cargando notificaciones...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (notificaciones.length === 0) {
    return <p>No tienes notificaciones.</p>;
  }

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Mis Notificaciones</h1>
      <div className="mt-8 overflow-x-auto"> {/* Added overflow-x-auto here */}
  <table className="min-w-full bg-white shadow-md rounded ">
    <thead>
      <tr className="bg-gray-200">
        <th className="px-4 py-2 text-left">Categoría</th> {/* Added text-left */}
        <th className="px-4 py-2 text-left">Título</th> {/* Added text-left */}
        <th className="px-4 py-2 text-left">Mensaje</th> {/* Added text-left */}
        <th className="px-4 py-2 text-left">Prioridad</th> {/* Added text-left */}
      </tr>
    </thead>
    <tbody>
      {notificaciones.map((notificacion) => (
        <tr key={notificacion.id} className="border-b border-gray-200">
          <td className="px-4 py-2">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeClass(notificacion.categoria).classes}`}
            >
              {notificacion.categoria}
            </span>
          </td>
          <td className="px-4 py-2">{notificacion.titulo}</td>
          <td className="px-4 py-2">{notificacion.mensaje}</td>
          <td className="px-4 py-2">{notificacion.prioridad}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
};

export default Notificaciones;