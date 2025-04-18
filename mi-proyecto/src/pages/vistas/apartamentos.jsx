import React, { useState, useEffect } from "react";
import {
  collection,
  setDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const Apartamentos = () => {
  const [apartamentos, setApartamentos] = useState([]); // Lista de apartamentos
  const [nuevoApartamento, setNuevoApartamento] = useState({
    codigo: "",
    direccion: "",
    descripcion: "",
    valor: "",
    ocupacion: false,
    conjunto: 1,
    activo: true, // Campo añadido: activo
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoApartamento, setEditandoApartamento] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false); // Estado para controlar la visibilidad de inactivos

  // Obtener apartamentos desde Firestore al montar el componente
  useEffect(() => {
    const obtenerApartamentos = async () => {
      try {
        const apartamentosRef = collection(db, "apartamentos");
        let q = query(apartamentosRef);
        if (!mostrarInactivos) {
          q = query(q, where("activo", "==", true));
        } else {
          q = query(q, where("activo", "==", false));
        }
        const querySnapshot = await getDocs(q);
        const apartamentosFirestore = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApartamentos(apartamentosFirestore);
      } catch (error) {
        console.error("Error al obtener apartamentos:", error);
      }
    };

    obtenerApartamentos();
  }, [mostrarInactivos]);

  const toggleInactivos = () => setMostrarInactivos(!mostrarInactivos);

  // Función para añadir o editar un apartamento
  const añadirApartamento = async () => {
    if (!nuevoApartamento.codigo || !nuevoApartamento.direccion || !nuevoApartamento.valor) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    try {
      if (editandoApartamento) {
        // Editar apartamento existente
        const apartamentoRef = doc(db, "apartamentos", editandoApartamento.codigo);
        await updateDoc(apartamentoRef, {
            ...nuevoApartamento,
            activo: editandoApartamento.activo,
        });
        setApartamentos(
          apartamentos.map((apto) =>
            apto.codigo === editandoApartamento.codigo ? { ...nuevoApartamento, id: apto.codigo } : apto
          )
        );
        setEditandoApartamento(null);
      } else {
        // Añadir nuevo apartamento con el código como ID y activo: true
        const apartamentoRef = doc(db, "apartamentos", nuevoApartamento.codigo);
        await setDoc(apartamentoRef, {
          ...nuevoApartamento,
          activo: true, // Añadimos el campo activo: true al crear
        });
        setApartamentos([...apartamentos, { ...nuevoApartamento, id: nuevoApartamento.codigo }]);
      }

      // Reiniciar el formulario
      setNuevoApartamento({
        codigo: "",
        direccion: "",
        descripcion: "",
        valor: "",
        ocupacion: false,
        conjunto: 1,
        activo: true, // Asegurar que el campo activo se reinicie correctamente
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al guardar el apartamento:", error);
      alert("Hubo un error al guardar el apartamento.");
    }
  };

  // Función para "eliminar" un apartamento (cambiar activo a false)
  const eliminarApartamento = async (codigo) => {
    try {
      const apartamentoRef = doc(db, "apartamentos", codigo);
      await updateDoc(apartamentoRef, { activo: false });
      // Actualizar el estado de apartamentos para reflejar el cambio
      setApartamentos((prevApartamentos) =>
        prevApartamentos.map((apto) =>
          apto.codigo === codigo ? { ...apto, activo: false } : apto,
        ).filter(apto => apto.activo !== mostrarInactivos)
        
      );
    } catch (error) {
      console.error("Error al \"eliminar\" el apartamento:", error);
      alert("Hubo un error al \"eliminar\" el apartamento.");
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gestión de Apartamentos{" "}
          <span className="text-gray-500 text-lg">({apartamentos.length} registrados)</span>
        </h1>
        <button
          onClick={toggleInactivos}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {mostrarInactivos ? "Mostrar Activos" : "Mostrar Inactivos"}
        </button>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoApartamento(null); // Asegurarse de que no esté en modo edición
          }}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Añadir Apartamento
        </button>
      </header>

      <p className="bg-gray-200 py-2 px-4 rounded-md shadow-sm text-center">
        {mostrarInactivos
          ? "Mostrando apartamentos inactivos"
          : "Mostrando apartamentos activos"}
      </p>

      {/* Lista de apartamentos */}
      <div>
        {apartamentos.length === 0 ? (
          <p className="text-gray-600">No hay apartamentos registrados.</p>
        ) : (
          <div className="space-y-4">
            {apartamentos.map((apto) => (
              <div
                key={apto.id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow"
              >
                {/* Indicador de estado */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      apto.ocupacion ? "bg-blue-500" : "bg-green-500"
                    }`}
                    title={apto.ocupacion ? "Ocupado" : "Disponible"}
                  ></div>
                  <div>                    
                    <p className="font-bold text-lg">{apto.codigo} - {apto.activo ? <b>Activo</b> : <b>Inactivo</b>}</p>
                    <p className="text-gray-600 text-sm">{apto.direccion}</p>
                  </div>
                </div>
                {/* Valor y acciones */}
                <div className="flex items-center space-x-6">
                  <p className="text-gray-800 font-semibold">${apto.valor.toLocaleString()}</p>
                  <button
                    onClick={() => {
                      setMostrarFormulario(true);
                      setEditandoApartamento(apto);
                      setNuevoApartamento(apto);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminarApartamento(apto.codigo)}
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

      {/* Formulario para añadir o editar apartamento */}
      {mostrarFormulario && (
        <div className="mt-4 p-4 bg-white shadow rounded">
          <h2 className="text-xl font-bold mb-4">
            {editandoApartamento ? "Editar Apartamento" : "Añadir Apartamento"}
          </h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Código del Apartamento"
              value={nuevoApartamento.codigo}
              onChange={(e) =>
                setNuevoApartamento({ ...nuevoApartamento, codigo: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Dirección del Apartamento"
              value={nuevoApartamento.direccion}
              onChange={(e) =>
                setNuevoApartamento({ ...nuevoApartamento, direccion: e.target.value })
              }
              className="border p-2 rounded"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={nuevoApartamento.descripcion}
              onChange={(e) =>
                setNuevoApartamento({ ...nuevoApartamento, descripcion: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Valor del Apartamento"
              value={nuevoApartamento.valor}
              onChange={(e) =>
                setNuevoApartamento({ ...nuevoApartamento, valor: e.target.value })
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
                onClick={añadirApartamento}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                {editandoApartamento ? "Guardar Cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartamentos;
