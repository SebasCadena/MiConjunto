import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const Contrato = ({ userId }) => {
  const [contrato, setContrato] = useState(null);
  const [apartamento, setApartamento] = useState(null);
  const [loading, setLoading] = useState(true);

  const calcularFechaPago = (fechaInicio, frecuencia) => {
    const fecha = new Date(fechaInicio);
    switch (frecuencia) {
      case "mensual":
        fecha.setMonth(fecha.getMonth() + 1);
        break;
      case "bimestral":
        fecha.setMonth(fecha.getMonth() + 2);
        break;
      case "semestral":
        fecha.setMonth(fecha.getMonth() + 6);
        break;
      default:
        console.warn("Frecuencia no reconocida:", frecuencia);
        break;
    }
    return fecha.toLocaleDateString();
  };

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

  if (loading) {
    return <p>Cargando datos del contrato...</p>;
  }

  return (
    <div className="p-8">
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
    </div>
  );
};

export default Contrato;