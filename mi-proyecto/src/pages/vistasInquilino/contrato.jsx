import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const Contrato = ({ userId }) => {
  const [contrato, setContrato] = useState(null);
  const [apartamento, setApartamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarPagos, setMostrarPagos] = useState(false); // Estado para alternar entre vistas

  useEffect(() => {
    const cargarDatosContrato = async () => {
      try {
        console.log("Cargando datos del contrato para el usuario:", userId);

        // Obtener contrato relacionado con el usuario
        const contratoQuery = query(
          collection(db, "contratos"),
          where("id_inquilino", "==", userId)
        );
        const contratoSnapshot = await getDocs(contratoQuery);

        if (!contratoSnapshot.empty) {
          const contratoDoc = contratoSnapshot.docs[0];
          const contratoData = contratoDoc.data();
          setContrato({ id: contratoDoc.id, ...contratoData });
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
      } catch (error) {
        console.error("Error al cargar los datos del contrato:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosContrato();
  }, [userId]);

  const handlePagarClick = () => {
    setMostrarPagos(true); // Cambia el estado para mostrar la sección de pagos
  };

  const handleVolverClick = () => {
    setMostrarPagos(false); // Cambia el estado para volver a la vista principal
  };

  const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("Número de cuenta copiado: " + texto);
  };

  if (loading) {
    return <p>Cargando datos del contrato...</p>;
  }

  return (
    <div className="p-8">
      {mostrarPagos ? (
        // Contenido de la sección de pagos
        <div>
          <h2 className="text-2xl font-bold mb-4">Pagos</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Tarjeta Bancolombia */}
            <div className="bg-blue-100 p-4 rounded shadow-md flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {/* Imagen del banco */}
                  <img
                    src="/path/to/bancolombia-logo.png"
                    alt="Bancolombia"
                    className="w-10 h-10"
                  />
                </div>
                <p className="font-semibold text-lg">Bancolombia</p>
              </div>
              <p className="font-semibold text-center text-gray-700">XXX-XXX-XXX</p>
              <button
                className="mt-4 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
                onClick={() => copiarTexto("XXX-XXX-XXX")}
              >
                Copiar
              </button>
            </div>

            {/* Tarjeta Davivienda */}
            <div className="bg-blue-100 p-4 rounded shadow-md flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {/* Imagen del banco */}
                  <img
                    src="/path/to/davivienda-logo.png"
                    alt="Davivienda"
                    className="w-10 h-10"
                  />
                </div>
                <p className="font-semibold text-lg">Davivienda</p>
              </div>
              <p className="font-semibold text-center text-gray-700">XXX-XXX-XXX</p>
              <button
                className="mt-4 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
                onClick={() => copiarTexto("XXX-XXX-XXX")}
              >
                Copiar
              </button>
            </div>

            {/* Tarjeta Nequi */}
            <div className="bg-blue-100 p-4 rounded shadow-md flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  {/* Imagen del banco */}
                  <img
                    src="/path/to/nequi-logo.png"
                    alt="Nequi"
                    className="w-10 h-10"
                  />
                </div>
                <p className="font-semibold text-lg">Nequi</p>
              </div>
              <p className="font-semibold text-center text-gray-700">XXX-XXX-XXX</p>
              <button
                className="mt-4 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
                onClick={() => copiarTexto("XXX-XXX-XXX")}
              >
                Copiar
              </button>
            </div>
          </div>
          <button
            className="mt-6 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={handleVolverClick}
          >
            Volver
          </button>
        </div>
      ) : (
        // Contenido principal del contrato
        <div>
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
                <p className="font-bold">{contrato?.nombre_inquilino || "Nombre no disponible"}</p>
                <p className="text-gray-600">N° Contrato: {contrato?.id || "No asignado"}</p>
                <p className="text-gray-600">
                  Apartamento: {contrato?.codigo_apartamento || "No asignado"}
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
            <button
              className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600"
              onClick={handlePagarClick}
            >
              Pagar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contrato;