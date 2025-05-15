import React, {useState, useEffect} from "react";
import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    setDoc,
} from "firebase/firestore";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {db, auth} from "../firebaseConfig";

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
    const [inquilinosLista, setInquilinos] = useState([]);
    const [nuevoInquilinoState, setNuevoInquilinoState] = useState({
        nombre: "",
        email: "",
        password: "",
        activo: true, // Añadimos el campo activo
    });
    const [editandoInquilinoState, setEditandoInquilinoState] = useState(null);
    const [mostrarFormularioState, setMostrarFormularioState] = useState(false);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);

    useEffect(() => {
        const obtenerInquilinos = async () => {
            try {
                const inquilinosRef = collection(db, "users");
                let q = query(inquilinosRef, where("rol", "==", "inquilino"));
                if (!mostrarInactivos) {
                    q = query(q, where("activo", "==", true));
                } else {
                    q = query(q, where("activo", "==", false));
                }
                const inquilinoSnapshot = await getDocs(q);
                const inquilinosData = inquilinoSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
                setInquilinos(inquilinosData);
            } catch (error) {
                console.error("Error al obtener inquilinos:", error);
            }
        };

        obtenerInquilinos();
    }, [mostrarInactivos]);

    const añadirInquilinoFunction = async () => {
        if (
            !nuevoInquilinoState.nombre ||
            !nuevoInquilinoState.email ||
            !nuevoInquilinoState.password
        ) {
            alert("Por favor, complete todos los campos");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, nuevoInquilinoState.email, nuevoInquilinoState.password
            );
            if (userCredential) {
                //Añadir inquilino a la base de datos
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    nombre: nuevoInquilinoState.nombre,
                    email: nuevoInquilinoState.email,
                    rol: "inquilino",
                    activo: true, // Agregamos el estado activo: true
                });
                setInquilinos([...inquilinosLista, {...nuevoInquilinoState, id: userCredential.user.uid}]);
            }
            setNuevoInquilinoState({
                nombre: "",
                email: "",
                password: "",
                activo: true,
            });
            setMostrarFormularioState(false);
        } catch (error) {
            console.error("Error al añadir el inquilino:", error);
            alert("Hubo un error al guardar el inquilino.");
        }
    };
    const editarInquilinoFunction = async () => {
        if (!editandoInquilinoState.nombre || !editandoInquilinoState.email) {
            alert("Por favor, complete todos los campos");
            return;
        }
        try {
            const userRef = doc(db, "users", editandoInquilinoState.id);
            await updateDoc(userRef, {
                ...editandoInquilinoState,
                activo: editandoInquilinoState.activo, //Se guarda el estado actual del inquilino
            });

            setInquilinos(
                inquilinosLista.map((user) =>
                    user.id === editandoInquilinoState.id ? editandoInquilinoState : user
                )
            );

            setEditandoInquilinoState(null);
            setMostrarFormularioState(false);
        } catch (error) {
            console.error("Error al editar el inquilino:", error);
            alert("Hubo un error al editar el inquilino.");
        }
    };

    const eliminarInquilinoFunction = async (idUser, email) => {
        try {
            const userRef = doc(db, "users", idUser);
            await updateDoc(userRef, {activo: mostrarInactivos ? true : false}); // Cambiamos el estado a false
            // Modificamos la lista de inquilinos, para cambiar el estado de activo del que se esta modificando.
            setInquilinos(
                inquilinosLista.map((user) =>
                    user.id === idUser ? {...user, activo: false} : user
                )
            );
        } catch (error) {
            console.error("Error al eliminar el inquilino:", error);
            alert("Hubo un error al eliminar el inquilino.");
        }
    };
    return (
        <>
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold w-full md:w-auto text-center md:text-left">
              Total Inquilinos: {inquilinosLista.length}
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                  onClick={() => {
                    setMostrarFormularioState(true);
                    setEditandoInquilinoState(null);
                  }}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full sm:w-auto"
              >
                Añadir Inquilino
              </button>
              <button
                  onClick={() => setMostrarInactivos(!mostrarInactivos)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full sm:w-auto"
              >
                {mostrarInactivos ? "Mostrar Activos" : "Mostrar Inactivos"}
              </button>
            </div>
          </header>


          <p>
                {mostrarInactivos ? "Mostrando inquilinos inactivos" : "Mostrando inquilinos activos"}
            </p>

            {/* Lista de inquilinos */}
          <div className="bg-teal-50 shadow rounded p-2 sm:p-4">
            {inquilinosLista.map((inquilino) => (
                <div
                    key={inquilino.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b py-3 px-2 gap-3"
                >
                  <div className="w-full sm:w-auto">
                    <p className="font-bold break-words">
                      {inquilino.nombre}{' '}
                      <span className="text-sm">
                        ({inquilino.activo === true ? "Activo" : "Inactivo"})
                    </span>
                    </p>
                    <p className="text-gray-600 text-sm break-words">{inquilino.email}</p>
                  </div>
                  <div className="flex flex-row gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    <button
                        onClick={() => setEditandoInquilinoState(inquilino)}
                        className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 text-sm flex-1 sm:flex-none"
                    >
                      Editar
                    </button>
                    <button
                        onClick={() =>
                            eliminarInquilinoFunction(inquilino.id, inquilino.email)
                        }
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 text-sm flex-1 sm:flex-none"
                    >
                      {mostrarInactivos ? "Reactivar" : "Eliminar"}
                    </button>
                  </div>
                </div>
            ))}
          </div>

            {/* Formulario para añadir o editar inquilino */}
            {mostrarFormularioState || editandoInquilinoState ? (
                <div className="mt-4 p-4 bg-white shadow rounded">
                    <h2 className="text-xl font-bold mb-4">
                        {editandoInquilinoState ? "Editar Inquilino" : "Añadir Inquilino"}
                    </h2>
                    <div className="flex flex-col space-y-4">
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={
                                editandoInquilinoState
                                    ? editandoInquilinoState.nombre
                                    : nuevoInquilinoState.nombre
                            }
                            onChange={(e) =>
                                editandoInquilinoState
                                    ? setEditandoInquilinoState({
                                        ...editandoInquilinoState,
                                        nombre: e.target.value,
                                    })
                                    : setNuevoInquilinoState({
                                        ...nuevoInquilinoState,
                                        nombre: e.target.value,
                                    })
                            }
                            className="border p-2 rounded"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={
                                editandoInquilinoState
                                    ? editandoInquilinoState.email
                                    : nuevoInquilinoState.email
                            }
                            onChange={(e) =>
                                editandoInquilinoState
                                    ? setEditandoInquilinoState({
                                        ...editandoInquilinoState,
                                        email: e.target.value,
                                    })
                                    : setNuevoInquilinoState({
                                        ...nuevoInquilinoState,
                                        email: e.target.value,
                                    })
                            }
                            className="border p-2 rounded"
                        />
                        {!editandoInquilinoState && (
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={nuevoInquilinoState.password}
                                onChange={(e) =>
                                    setNuevoInquilinoState({
                                        ...nuevoInquilinoState,
                                        password: e.target.value,
                                    })
                                }
                                className="border p-2 rounded"
                            />
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setMostrarFormularioState(false);
                                    setEditandoInquilinoState(null);
                                }}
                                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={
                                    editandoInquilinoState
                                        ? editarInquilinoFunction
                                        : añadirInquilinoFunction
                                }
                                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                            >
                                {editandoInquilinoState ? "Guardar Cambios" : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default Inquilinos;
