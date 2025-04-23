import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";

const Pagos = ({ userId }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        console.log("Intentando cargar pagos...");
        const pagosQuery = query(
          collection(db, "pagos"),
          where("num_contrato", "==", userId)
        );
        const pagosSnapshot = await getDocs(pagosQuery);
  
        const pagosList = pagosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        console.log("Pagos cargados:", pagosList);
        setPagos(pagosList);
      } catch (error) {
        console.error("Error al cargar los pagos:", error);
      } finally {
        setLoading(false);
      }
    };
  
    cargarPagos();
  }, [userId]);
  const descargarPago = (pago) => {
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text("Detalle del Pago", 20, 20);

    // Información del pago
    doc.setFontSize(12);
    doc.text(`Número de Contrato: ${pago.num_contrato}`, 20, 40);
    doc.text(`Número de Factura: ${pago.num_factura}`, 20, 50);
    doc.text(
      `Fecha de Pago: ${new Date(pago.fecha_pago.seconds * 1000).toLocaleDateString("es-ES")}`,
      20,
      60
    );

    // Guardar el archivo PDF
    doc.save(`Pago_${pago.id}.pdf`);
  };

  if (loading) {
    return <p>Cargando pagos...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pagos Realizados</h2>
      {pagos.length === 0 ? (
        <p>No se encontraron pagos realizados.</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Fecha de Pago</th>
              <th className="border border-gray-300 px-4 py-2">Número de Factura</th>
              <th className="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(pago.fecha_pago.seconds * 1000).toLocaleDateString("es-ES")}
                </td>
                <td className="border border-gray-300 px-4 py-2">{pago.num_factura}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => descargarPago(pago)}
                    className="py-1 px-3 bg-teal-500 text-white rounded hover:bg-teal-600"
                  >
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Pagos;