import { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig"; // Importa la configuración de Firebase
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; // Para Firestore
import { signOut } from "firebase/auth"; // Para cerrar sesión

const PanelInquilino = ({ userId }) => {
  const [usuario, setUsuario] = useState(null);
  const [contrato, setContrato] = useState(null);
  const [apartamento, setApartamento] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para calcular la próxima fecha de pago
  const calcularFechaPago = (fechaInicio, frecuencia) => {
    const fecha = new Date(fechaInicio); // Convierte la fecha_inicio a un objeto Date
    switch (frecuencia) {
      case "mensual":
        fecha.setMonth(fecha.getMonth() + 1); // Suma 1 mes
        break;
      case "bimestral":
        fecha.setMonth(fecha.getMonth() + 2); // Suma 2 meses
        break;
      case "semestral":
        fecha.setMonth(fecha.getMonth() + 6); // Suma 6 meses
        break;
      default:
        console.warn("Frecuencia no reconocida:", frecuencia);
        break;
    }
    return fecha.toLocaleDateString(); // Devuelve la fecha en formato legible
  };

  // Cargar datos del usuario, contrato y apartamento
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log("Cargando datos para el usuario:", userId);

        // Obtener datos del usuario
        const usuarioRef = doc(db, "users", userId);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const usuarioData = usuarioSnap.data();
          setUsuario(usuarioData);
          console.log("Usuario encontrado:", usuarioData);

          // Obtener contrato relacionado con el usuario
          const contratoQuery = query(
            collection(db, "contratos"),
            where("id_inquilino", "==", userId)
          );
          const contratoSnapshot = await getDocs(contratoQuery);

          if (!contratoSnapshot.empty) {
            const contratoDoc = contratoSnapshot.docs[0];
            const contratoData = contratoDoc.data();
            setContrato({ id: contratoDoc.id, ...contratoData }); // Incluye el ID del documento
            console.log("Contrato encontrado:", { id: contratoDoc.id, ...contratoData });

            // Obtener apartamento relacionado con el contrato
            const apartamentoQuery = query(
              collection(db, "apartamentos"),
              where("codigo", "==", contratoData.codigo_apartamento)
            );
            const apartamentoSnapshot = await getDocs(apartamentoQuery);

            if (!apartamentoSnapshot.empty) {
              const apartamentoData = apartamentoSnapshot.docs[0].data();
              setApartamento(apartamentoData);
              console.log("Apartamento encontrado:", apartamentoData);
            } else {
              console.warn("No se encontró el apartamento con el código:", contratoData.codigo_apartamento);
            }
          } else {
            console.warn("No se encontró un contrato para el usuario:", userId);
          }
        } else {
          console.error("No se encontró el documento del usuario.");
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      cargarDatos();
    }
  }, [userId]);

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

  if (loading) {
    return <p>Cargando información del usuario...</p>;
  }

  return (
    <div className="flex h-screen bg-teal-50">
      {/* Barra lateral */}
      <aside className="w-1/4 bg-teal-100 p-6 flex flex-col items-center">
        <div className="mb-6 text-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full mb-4 mx-auto"></div>
          <h2 className="font-bold text-lg">Mi Conjunto</h2>
          <p className="text-gray-600">{usuario?.nombre || "Nombre no disponible"}</p>
        </div>
        <nav className="flex flex-col space-y-4 w-full">
          <button className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200">
            Foro
          </button>
          <button className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200">
            Editar Perfil
          </button>
          <button
            onClick={cerrarSesion}
            className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Villa Campestre</h1>
        </div>

        <div className="bg-white p-6 rounded shadow-md text-center mb-6">
          <p className="text-lg font-semibold">
            Apartamento: {apartamento?.codigo || "No asignado"}
          </p>
          <p className="text-gray-600">
            Dirección: {apartamento?.direccion || "No disponible"}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow-md flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mr-4"></div>
            <div>
              <p className="font-bold">{usuario?.nombre || "Nombre no disponible"}</p>
              <p className="text-gray-600">
                N° Contrato - {contrato?.id || "No asignado"}
              </p>
              <p className="text-gray-600">
                Apartamento: {apartamento?.codigo || "No asignado"}
              </p>
              <p className="text-gray-600">
                Fecha Pago:{" "}
                {contrato?.fecha_inicio
                  ? calcularFechaPago(contrato.fecha_inicio.toDate(), contrato.frecuencia)
                  : "No disponible"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">
              Total: ${contrato?.valor_apartamento || "0"}
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600">
            Visitas
          </button>
          <button className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600">
            Reservar
          </button>
          <button className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600">
            Pagar
          </button>
        </div>
      </main>
    </div>
  );
};

export default PanelInquilino;