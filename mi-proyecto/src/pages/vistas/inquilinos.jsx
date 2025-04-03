import React from "react";

const Inquilinos = ({
  inquilinos,
  setMostrarFormulario,
  setEditandoInquilino,
  eliminarInquilino,
  mostrarFormulario,
  editandoInquilino,
  nuevoInquilino,
  setNuevoInquilino,
  añadirInquilino,
  editarInquilino,
}) => {
  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Total Inquilinos: {inquilinos.length}</h1>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditandoInquilino(null); // Asegurarse de que no esté en modo edición
          }}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Añadir Inquilino
        </button>
      </header>

      {/* Lista de inquilinos */}
      <div className="bg-teal-50 shadow rounded p-4">
        {inquilinos.map((inquilino) => (
          <div
            key={inquilino.id}
            className="flex items-center justify-between border-b py-2"
          >
            <div>
              <p className="font-bold">{inquilino.nombre}</p>
              <p className="text-gray-600">{inquilino.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setEditandoInquilino(inquilino)}
                className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarInquilino(inquilino.id, inquilino.id)}
                className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para añadir o editar inquilino */}
        {mostrarFormulario || editandoInquilino ? (
          <div className="mt-4 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">
              {editandoInquilino ? "Editar Inquilino" : "Añadir Inquilino"}
            </h2>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={editandoInquilino ? editandoInquilino.nombre : nuevoInquilino.nombre}
                onChange={(e) =>
                  editandoInquilino
                    ? setEditandoInquilino({ ...editandoInquilino, nombre: e.target.value })
                    : setNuevoInquilino({ ...nuevoInquilino, nombre: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={editandoInquilino ? editandoInquilino.email : nuevoInquilino.email}
                onChange={(e) =>
                  editandoInquilino
                    ? setEditandoInquilino({ ...editandoInquilino, email: e.target.value })
                    : setNuevoInquilino({ ...nuevoInquilino, email: e.target.value })
                }
                className="border p-2 rounded"
              />
              {!editandoInquilino && (
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={nuevoInquilino.password}
                  onChange={(e) =>
                    setNuevoInquilino({ ...nuevoInquilino, password: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditandoInquilino(null);
                  }}
                  className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={editandoInquilino ? editarInquilino : añadirInquilino}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  {editandoInquilino ? "Guardar Cambios" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
    </>
  );
};

export default Inquilinos;