import { useState, useEffect } from "react";

const EditarPerfil = ({ userId }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        console.log("Cargando datos del usuario para edición:", userId);

        // Obtener datos del usuario desde el backend o Firestore
        const response = await fetch(`http://localhost:5000/obtenerUsuario/${userId}`);
        if (!response.ok) {
          throw new Error("Error al cargar los datos del usuario.");
        }

        const usuario = await response.json();
        setNombre(usuario.nombre || "");
        setEmail(usuario.email || "");
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      cargarDatosUsuario();
    }
  }, [userId]);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      const response = await fetch("http://localhost:5000/editarUsuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userId,
          email,
          nombre,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el usuario.");
      }

      alert("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert(error.message || "Hubo un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <p>Cargando datos del perfil...</p>;
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>
      <div className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className={`py-2 px-4 rounded ${
              guardando
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;