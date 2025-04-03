import { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig"; // Importa la configuración de Firebase
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore"; // Para Firestore
import { createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth"; // Para Authentication


import Inquilinos from "./vistas/inquilinos";
import Apartamentos from "./vistas/apartamentos";
import Contratos from "./vistas/contratos";
import EstadoPagos from "./vistas/estadoPagos";
import Ingresos from "./vistas/ingresos";


const PanelDueño = () => {
  const [inquilinos, setInquilinos] = useState([]);
  const [nuevoInquilino, setNuevoInquilino] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoInquilino, setEditandoInquilino] = useState(null); // Para editar

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
    if (!nuevoInquilino.nombre || !nuevoInquilino.email || !nuevoInquilino.password) {
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
      setInquilinos([...inquilinos, { id: userUID, ...nuevoRegistro }]);
      setNuevoInquilino({ nombre: "", email: "", password: "" }); // Limpiar el formulario
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al añadir el inquilino:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("El correo electrónico ya está en uso. Por favor, utiliza otro.");
      } else if (error.code === "auth/invalid-email") {
        alert("El correo electrónico no es válido.");
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
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
        body: JSON.stringify({ uid }),
      });

      if (response.ok) {
        alert("Inquilino eliminado correctamente.");
      } else {
        console.error("Error al eliminar el usuario de Authentication:", await response.text());
        alert("El inquilino fue eliminado de Firestore, pero no de Authentication.");
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
              inquilino.id === editandoInquilino.id ? editandoInquilino : inquilino
            )
          );
          setEditandoInquilino(null);
          alert("Inquilino actualizado correctamente.");
        } else {
          console.error("Error al editar el usuario de Authentication:", await response.text());
          alert("El inquilino fue actualizado en Firestore, pero no en Authentication.");
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
    
    <div className="flex h-screen">
      
      {/* Barra lateral */}
      <aside className="w-1/4 bg-teal-100 p-4 flex flex-col items-center">
        <div className="mb-6 text-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full mb-4 mx-auto"></div>
          <p className="font-bold">Perfil: Juan Sebastian Cadena Varela</p>
          <p className="text-gray-600">Dueño</p>
        </div>
          <nav className="flex flex-col space-y-4 w-full">
            <button
              onClick={() => setVistaActiva("inquilinos")}
              className={`py-2 px-4 rounded ${vistaActiva === "inquilinos" ? "bg-blue-200" : "bg-blue-100"} hover:bg-blue-200`}
            >
              Inquilinos
            </button>
            <button
              onClick={() => setVistaActiva("apartamentos")}
              className={`py-2 px-4 rounded ${vistaActiva === "apartamentos" ? "bg-blue-200" : "bg-blue-100"} hover:bg-blue-200`}
            >
              Apartamentos
            </button>
            <button
              onClick={() => setVistaActiva("contratos")}
              className={`py-2 px-4 rounded ${vistaActiva === "contratos" ? "bg-blue-200" : "bg-blue-100"} hover:bg-blue-200`}
            >
              Contratos
            </button>
            <button
              onClick={() => setVistaActiva("estadoPagos")}
              className={`py-2 px-4 rounded ${vistaActiva === "estadoPagos" ? "bg-blue-200" : "bg-blue-100"} hover:bg-blue-200`}
            >
              Estado de Pagos
            </button>
            <button
              onClick={() => setVistaActiva("ingresos")}
              className={`py-2 px-4 rounded ${vistaActiva === "ingresos" ? "bg-blue-200" : "bg-blue-100"} hover:bg-blue-200`}
            >
              Ingresos
          </button>
          </nav>
        <button
          onClick={cerrarSesion}
          className="mt-auto bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </aside>
  
      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gray-100">

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
        {vistaActiva === "apartamentos" && <Apartamentos />}
        {vistaActiva === "contratos" && <Contratos />}
        {vistaActiva === "estadoPagos" && <EstadoPagos />}
        {vistaActiva === "ingresos" && <Ingresos />}


      </main>
    </div>
  );
};

export default PanelDueño;