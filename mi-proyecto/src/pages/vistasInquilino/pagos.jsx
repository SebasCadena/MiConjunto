import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Importar firebaseConfig
import { collection, getDocs, query, where } from "firebase/firestore"; // Importar addDoc
import jsPDF from "jspdf"; // Importar jsPDF para generar PDF
import useAuth from "../../hooks/useAuth"; // Importar el hook useAuth
import { getContratos } from "../../utils"; // Importar getContratos

function Pagos({ userId }) {
  const { user, loading: authLoading } = useAuth();
  const [pagos, setPagos] = useState([]); // Estado para los cobros
  const [contratos, setContratos] = useState([]); // Estado para los contratos

  //metodos de pago, solo es estatico, esto luego se debe modificar y almacenar en la base de datos
  const metodosPago = ["Transferencia Bancaria", "Nequi", "Daviplata"];

  useEffect(() => {
    const cargarCobros = async () => {
      try {
        // Verificar si userId es correcto
        if (!userId) {
          console.error("Error: userId no está definido.");
          return;
        }

        // Buscar el contrato del inquilino
        const contratosData = await getContratos(); // Obtener todos los contratos
        setContratos(contratosData); // Establecer los contratos en el estado
        //filtrar los contratos por el id del inquilino
        const contratosInquilino = contratosData.filter(
          (contrato) => contrato.id_inquilino === userId
        );

        // Verificar si hay contratos para el inquilino
        if (contratosInquilino.length > 0) {
          // Tomamos el primer contrato que encontremos
          const contrato = contratosInquilino[0];
          const pagos = [];
          for (const cobro of contrato.cobros) {
            if (cobro.id_pago) {
              // Agregar solo los cobros que son pagos
              const pagoData = { ...cobro };
              pagos.push(pagoData);
            }
          }
          setPagos(pagos);
        }
      } catch (error) {
        console.error("Error al cargar los pagos:", error);
      } finally {
      }
    };

    if (!authLoading && user) {
      cargarCobros();
    }
  }, [authLoading, user]);
  const doc = new jsPDF({
    orientation: "landscape",
  });

  const generatePDF = () => {
    // Espaciado superior
    let y = 20;

    // Título de la lista de pagos
    doc.setFontSize(18);
    doc.text("Villa Campestre", 10, y); // Título principal
    doc.setFontSize(12);
    y = y + 10;
    doc.text("Lista de Pagos", 10, y); // Subtítulo

    y = y + 15; // Espaciado después del título

    const startX = 10; // Posición horizontal inicial
    const lineHeight = 10; // Espacio entre líneas
    const columnWidths = [35, 70, 40, 30, 40, 20]; // Anchos de columna ajustados

    // Encabezados de la tabla
    const headers = [
      "Fecha",
      "Inquilino",
      "Apartamento",
      "Valor",
      "Factura",
      "Estado",
    ];
    doc.setFontSize(12);
    doc.setFillColor(200, 220, 255); // Color de fondo azul claro para los encabezados
    doc.rect(
      startX,
      y,
      columnWidths.reduce((a, b) => a + b, 0),
      lineHeight,
      "F"
    ); // Rectángulo de fondo
    doc.setTextColor(255, 255, 255); // Texto blanco para los encabezados
    let currentX = startX;
    headers.forEach((header, index) => {
      doc.text(header, currentX + columnWidths[index] / 2, y + lineHeight / 2, {
        align: "center",
      });
      currentX += columnWidths[index];
    });
    doc.setTextColor(0, 0, 0); // Volver a negro
    doc.line(startX, y + lineHeight, currentX, y + lineHeight); // Línea horizontal después de los encabezados
    y = y + lineHeight;

    // Datos de los pagos
    doc.setFontSize(10);

    // Espaciado inferior antes de guardar
    //Borde alrededor de la tabla
    doc.rect(
      startX,
      y - pagos.length * lineHeight,
      columnWidths.reduce((a, b) => a + b, 0),
      pagos.length * lineHeight
    );

    y = y + 20;
    doc.save(`lista_de_pagos.pdf`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagos</h1>
      {authLoading ? (
        <p>Cargando...</p>
      ) : !user ? (
        <p>No hay usuario logueado</p>
      ) : contratos.length > 0 ? (
        <div>
          {pagos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 ">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Fecha</th>
                    <th className="py-2 px-4 border-b">Inquilino</th>
                    <th className="py-2 px-4 border-b">Apartamento</th>
                    <th className="py-2 px-4 border-b">Valor</th>
                    <th className="py-2 px-4 border-b">Factura</th>
                    <th className="py-2 px-4 border-b">Metodo de pago</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.id_pago}>
                      <td className="py-2 px-4 border-b">
                        {pago.fecha_pago.toDate().toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {
                          contratos.find(
                            (contrato) => contrato.id === pago.contratoId
                          ).nombre_inquilino
                        }
                      </td>
                      <td className="py-2 px-4 border-b">
                        {
                          contratos.find(
                            (contrato) => contrato.id === pago.contratoId
                          ).codigo_apartamento
                        }
                      </td>
                      <td className="py-2 px-4 border-b">
                        ${pago.valor_pagado}
                      </td>
                      <td className="py-2 px-4 border-b">{pago.num_factura}</td>
                      <td className="py-2 px-4 border-b">{pago.metodo_pago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay pagos registrados.</p>
          )}
          <button
            onClick={generatePDF}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generar PDF
          </button>
        </div>
      ) : (
        <p>No tienes contratos asociados</p>
      )}
    </div>
  );
}

export default Pagos;
