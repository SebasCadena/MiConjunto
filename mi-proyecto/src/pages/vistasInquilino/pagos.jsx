import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
  
const Pagos = ({ userId }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        console.log("1. Intentando cargar pagos para userId:", userId);

        // Verificar si userId es correcto
        if (!userId) {
          console.error("Error: userId no está definido.");
          setLoading(false);
          return;
        }

        // Buscar el contrato del inquilino
        const contratosQuery = query(
          collection(db, "contratos"),
          where("id_inquilino", "==", userId)
        );
        console.log("2. Consulta a 'contratos':", contratosQuery);
        const contratosSnapshot = await getDocs(contratosQuery);
        console.log("3. Contratos encontrados:", contratosSnapshot.docs.length);

        // Asumiendo que solo hay un contrato
        const contrato =
          contratosSnapshot.docs.length > 0
            ? { id: contratosSnapshot.docs[0].id, ...contratosSnapshot.docs[0].data() }
            : null;

        if (contratosSnapshot.docs.length > 0) {
          console.log("4. Datos del contrato encontrado:", contrato);
        }
        if (!contrato) {
          console.log("5. No se encontró contrato para el inquilino.");
          setLoading(false);
          setPagos([]);
          return; // Salir de la función
        }

         // Obtener nombre del inquilino
        const userRef = doc(db, "users", contrato.id_inquilino);
        const userSnap = await getDoc(userRef);
        const nombreInquilino = userSnap.exists() ? userSnap.data().nombre : "Nombre no encontrado";

        // Buscar los pagos asociados al contrato
        //Obtenemos el id del documento del contrato

        const contratoId = contrato.id;
        console.log("Id del contrato:", contratoId);
        const pagosQuery = query(
          collection(db, "pagos"),
          where("num_contrato", "==", contratoId)
        );
        console.log("6. Consulta a 'pagos':", pagosQuery);
        const pagosSnapshot = await getDocs(pagosQuery);
        console.log("7. Pagos encontrados:", pagosSnapshot.docs.length);

        const pagosList = await Promise.all(
          pagosSnapshot.docs.map(async (doc) => {
            const pagoData = {
              id: doc.id,
              ...doc.data(),
              nombreInquilino: nombreInquilino,
              codigoApartamento: contrato.codigo_apartamento,
              valorPago: contrato.valor_apartamento
            };
            return pagoData;
          })
        );

        console.log("8. Pagos cargados:", pagosList);
        setPagos(pagosList);
      } catch (error) {
        console.error("Error al cargar los pagos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPagos();
  }, [userId]);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    });

    // Espaciado superior
    let y = 20;

    // Título de la lista de pagos
    doc.setFontSize(18);   
    doc.text("Villa Campestre", 10, y); // Título principal
    doc.setFontSize(12);
    y = y + 10
    doc.text("Lista de Pagos", 10, y); // Subtítulo

    y = y + 15; // Espaciado después del título

    const startX = 10; // Posición horizontal inicial
    const lineHeight = 10; // Espacio entre líneas
    const columnWidths = [35, 70, 40, 30, 40, 20]; // Anchos de columna ajustados

    // Encabezados de la tabla
      const headers = ["Fecha", "Inquilino", "Apartamento", "Valor", "Factura", "Estado"];
      doc.setFontSize(12);
      doc.setFillColor(200, 220, 255); // Color de fondo azul claro para los encabezados
      doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), lineHeight, "F"); // Rectángulo de fondo
      doc.setTextColor(255, 255, 255); // Texto blanco para los encabezados
      let currentX = startX;
      headers.forEach((header, index) => {
        doc.text(header, currentX + columnWidths[index] / 2, y + lineHeight / 2, { align: "center" });
        currentX += columnWidths[index];
      });
      doc.setTextColor(0, 0, 0); // Volver a negro
      doc.line(startX, y + lineHeight, currentX, y + lineHeight); // Línea horizontal después de los encabezados
    y = y + lineHeight;
    
      // Datos de los pagos
      doc.setFontSize(10);
      pagos.forEach((pago, pagoIndex) => {
        currentX = startX;
       const rowData = [
         pago.fecha_pago.toDate().toLocaleDateString(),
         pago.nombreInquilino,
         pago.codigoApartamento,
         pago.valorPago,
         pago.num_factura,
         "pagado",
       ];
        // Color de fondo para las filas alternadas
        if (pagoIndex % 2 === 0) {
          doc.setFillColor(240, 240, 240); // Gris claro
        } else {
          doc.setFillColor(255, 255, 255); // Blanco
        }
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), lineHeight, "F");
        rowData.forEach((data, index) => {
          doc.text(String(data), currentX + columnWidths[index] / 2, y + lineHeight / 2, { align: "center" });
          currentX += columnWidths[index];
        });
        doc.line(startX, y + 2, currentX, y + 2); // Línea horizontal después de cada fila
        y = y + lineHeight;
      });

    // Espaciado inferior antes de guardar
      // Borde alrededor de la tabla
      doc.rect(startX, y - (pagos.length) * lineHeight, columnWidths.reduce((a, b) => a + b, 0), (pagos.length) * lineHeight);
    
    y = y + 20;

      // Guardar el PDF
      doc.save("lista_de_pagos.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagos</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : pagos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Inquilino</th>
                <th className="py-2 px-4 border-b">Apartamento</th>
                <th className="py-2 px-4 border-b">Valor</th>
                <th className="py-2 px-4 border-b">Factura</th>
                <th className="py-2 px-4 border-b">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id}>
                  <td className="py-2 px-4 border-b">{                     
                     pago.fecha_pago.toDate().toLocaleDateString()
                    }</td>
                  <td className="py-2 px-4 border-b">{pago.nombreInquilino}</td>
                  <td className="py-2 px-4 border-b">{pago.codigoApartamento}</td>
                  <td className="py-2 px-4 border-b">{pago.valorPago}</td>
                  <td className="py-2 px-4 border-b">{pago.num_factura}</td>
                  <td className="py-2 px-4 border-b">{'pagado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={generatePDF}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generar PDF
          </button>
        </div>
      ) : (
        <p>No hay pagos registrados.</p>
      )}
    </div>
  );
};

export default Pagos;
