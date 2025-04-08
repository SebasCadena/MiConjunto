import React, { useState, useEffect } from "react";
import { collection, setDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const EstadoPagos = () => {
  const [zonasComunes, setZonasComunes] = useState([]); // Lista de zonas comunes
  const [nuevaZona, setNuevaZona] = useState({
    nombre_zona: "",
    horario_inicio: "",
    horario_final: "",
    capacidad: "",
    conjunto: "",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoZona, setEditandoZona] = useState(null);

  // Obtener zonas comunes desde Firestore al montar el componente
  useEffect(() => {
    const obtenerZonasComunes = async () => {
      const querySnapshot = await getDocs(collection(db, "zonas"));
      const zonasFirestore = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setZonasComunes(zonasFirestore);
    };

    obtenerZonasComunes();
  }, []);

  // Función para añadir o editar una zona común
  const guardarZonaComun = async () => {
    if (
      !nuevaZona.nombre_zona ||
      !nuevaZona.horario_inicio ||
      !nuevaZona.horario_final ||
      !nuevaZona.capacidad ||
      !nuevaZona.conjunto
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      if (editandoZona) {
        // Editar zona existente
        const zonaRef = doc(db, "zonas", editandoZona.id);
        await updateDoc(zonaRef, nuevaZona);
        setZonasComunes(
          zonasComunes.map((zona) =>
            zona.id === editandoZona.id ? { ...nuevaZona, id: zona.id } : zona
          )
        );
        setEditandoZona(null);
      } else {
        // Añadir nueva zona con un ID generado automáticamente
        const zonaRef = doc(collection(db, "zonas"));
        await setDoc(zonaRef, nuevaZona);
        setZonasComunes([...zonasComunes, { ...nuevaZona, id: zonaRef.id }]);
      }

      // Reiniciar el formulario
      setNuevaZona({
        nombre_zona: "",
        horario_inicio: "",
        horario_final: "",
        capacidad: "",
        conjunto: "",
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al guardar la zona común:", error);
      alert("Hubo un error al guardar la zona común.");
    }
  };

  // Función para eliminar una zona común
  const eliminarZonaComun = async (id) => {
    try {
      await deleteDoc(doc(db, "zonas", id));
      setZonasComunes(zonasComunes.filter((zona) => zona.id !== id));
    } catch (error) {
      console.error("Error al eliminar la zona común:", error);
      alert("Hubo un error al eliminar la zona común.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gestión de Zonas Comunes{" "}
          <span className="text-gray-500 text-lg">({zonasComunes.length} registradas)</span>
        </h1>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoZona(null); // Asegurarse de que no esté en modo edición
          }}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Añadir Zona Común
        </button>
      </header>

      {/* Formulario para añadir o editar zona común */}
      {mostrarFormulario && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editandoZona ? "Editar Zona Común" : "Añadir Zona Común"}
          </h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Nombre de la Zona"
              value={nuevaZona.nombre_zona}
              onChange={(e) =>
                setNuevaZona({ ...nuevaZona, nombre_zona: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Horario Inicio (Ej: 8:00 AM)"
              value={nuevaZona.horario_inicio}
              onChange={(e) =>
                setNuevaZona({ ...nuevaZona, horario_inicio: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Horario Final (Ej: 8:00 PM)"
              value={nuevaZona.horario_final}
              onChange={(e) =>
                setNuevaZona({ ...nuevaZona, horario_final: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={nuevaZona.capacidad}
              onChange={(e) =>
                setNuevaZona({ ...nuevaZona, capacidad: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Conjunto"
              value={nuevaZona.conjunto}
              onChange={(e) =>
                setNuevaZona({ ...nuevaZona, conjunto: e.target.value })
              }
              className="border p-2 rounded"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={guardarZonaComun}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                {editandoZona ? "Guardar Cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de zonas comunes */}
      <div>
        {zonasComunes.length === 0 ? (
          <p className="text-gray-600">No hay zonas comunes registradas.</p>
        ) : (
          <div className="space-y-4">
            {zonasComunes.map((zona) => (
              <div
                key={zona.id}
                className="flex items-center justify-between p-4 bg-gray-200 rounded-lg shadow"
              >
                {/* Información de la zona */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-bold text-lg">{zona.nombre_zona}</p>
                    <p className="text-gray-600 text-sm">
                      Horario:{" "}
                      {zona.horario_inicio?.seconds
                        ? new Date(zona.horario_inicio.seconds * 1000).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : zona.horario_inicio}{" "}
                      -{" "}
                      {zona.horario_final?.seconds
                        ? new Date(zona.horario_final.seconds * 1000).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : zona.horario_final}
                    </p>
                    <p className="text-gray-600 text-sm">Capacidad: {zona.capacidad}</p>
                    <p className="text-gray-600 text-sm">Conjunto: {zona.conjunto}</p>
                  </div>
                </div>
                {/* Acciones */}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => {
                      setMostrarFormulario(true);
                      setEditandoZona(zona);
                      setNuevaZona(zona);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminarZonaComun(zona.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadoPagos;