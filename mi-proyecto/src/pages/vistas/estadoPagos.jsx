import React, { useState } from "react";

const EstadoPagos = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [zonasComunes, setZonasComunes] = useState([
    { id: 1, nombre: "Piscina", horario: "8:00 AM - 8:00 PM", capacidad: "50 personas", conjunto: "Conjunto1" },
    { id: 2, nombre: "Gimnasio", horario: "6:00 AM - 10:00 PM", capacidad: "20 personas", conjunto: "Conjunto1" },
    { id: 3, nombre: "Salón de Eventos", horario: "Reservado", capacidad: "50 personas", conjunto: "Conjunto1" },
  ]);
  const [nuevaZona, setNuevaZona] = useState({
    nombre: "",
    horario: "",
    capacidad: "",
    conjunto: "",
  });

  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
  };

  const añadirZonaComun = () => {
    if (!nuevaZona.nombre || !nuevaZona.horario || !nuevaZona.capacidad || !nuevaZona.conjunto) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setZonasComunes([
      ...zonasComunes,
      { id: zonasComunes.length + 1, ...nuevaZona },
    ]);
    setNuevaZona({ nombre: "", horario: "", capacidad: "", conjunto: "" });
    setMostrarFormulario(false);
  };

  const eliminarZonaComun = (id) => {
    setZonasComunes(zonasComunes.filter((zona) => zona.id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gestión de Zonas Comunes{" "}
          <span className="text-gray-500 text-lg">({zonasComunes.length} registradas)</span>
        </h1>
        <button
          onClick={toggleFormulario}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          {mostrarFormulario ? "Cerrar Formulario" : "Añadir Zona Común"}
        </button>
      </header>

      {/* Formulario para añadir una nueva zona común */}
      {mostrarFormulario && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Añadir Zona Común</h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Nombre de la Zona"
              value={nuevaZona.nombre}
              onChange={(e) => setNuevaZona({ ...nuevaZona, nombre: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Horario"
              value={nuevaZona.horario}
              onChange={(e) => setNuevaZona({ ...nuevaZona, horario: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Capacidad"
              value={nuevaZona.capacidad}
              onChange={(e) => setNuevaZona({ ...nuevaZona, capacidad: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Conjunto"
              value={nuevaZona.conjunto}
              onChange={(e) => setNuevaZona({ ...nuevaZona, conjunto: e.target.value })}
              className="border p-2 rounded"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={toggleFormulario}
                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={añadirZonaComun}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Zonas Comunes */}
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
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-bold text-lg">{zona.nombre}</p>
                    <p className="text-gray-600 text-sm">Horario: {zona.horario}</p>
                    <p className="text-gray-600 text-sm">Capacidad: {zona.capacidad}</p>
                    <p className="text-gray-600 text-sm">Conjunto: {zona.conjunto}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => alert("Función de edición no implementada aún.")}
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