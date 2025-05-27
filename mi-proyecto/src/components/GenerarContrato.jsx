import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";

export default function ContratoGenerado({ contrato }) {
  const sigCanvas = useRef(null);
  const [firmaURL, setFirmaURL] = useState(null);

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CONTRATO DE ARRENDAMIENTO DE APARTAMENTO", 20, 20);
    doc.setFontSize(12);
    doc.text(`Entre las partes:`, 20, 35);
    doc.text(`ARRENDADOR: ___________________________`, 20, 45);
    doc.text(`ARRENDATARIO: ${contrato.nombre_inquilino}`, 20, 55);
    doc.text(`Apartamento: ${contrato.codigo_apartamento}`, 20, 65);
    doc.text(`Valor mensual: $${contrato.valor_apartamento}`, 20, 75);
    doc.text(`Frecuencia de pago: ${contrato.frecuencia}`, 20, 85);
    doc.text(`Fecha de inicio: ${contrato.fecha_inicio}`, 20, 95);
    doc.text(`Fecha de finalización: ${contrato.fecha_fin}`, 20, 105);

    doc.setFontSize(12);
    doc.text("CLÁUSULAS:", 20, 120);
    doc.setFontSize(10);
    doc.text("1. El arrendatario se compromete a pagar el canon de arrendamiento en la frecuencia y valor establecidos.", 20, 130, { maxWidth: 170 });
    doc.text("2. El apartamento será destinado exclusivamente para uso habitacional.", 20, 140, { maxWidth: 170 });
    doc.text("3. El arrendatario deberá mantener el inmueble en buen estado y responderá por los daños ocasionados.", 20, 150, { maxWidth: 170 });
    doc.text("4. El contrato tendrá una duración desde la fecha de inicio hasta la fecha de finalización, salvo prórroga o terminación anticipada conforme a la ley.", 20, 160, { maxWidth: 170 });
    doc.text("5. Cualquier controversia será resuelta conforme a la legislación vigente.", 20, 170, { maxWidth: 170 });

    if (firmaURL) {
      doc.text("Firma del arrendatario:", 20, 190);
      doc.addImage(firmaURL, "PNG", 20, 195, 60, 30);
    }

    doc.text("Firma del arrendador: ___________________________", 20, 230);

    doc.save(`Contrato_${contrato.nombre_inquilino}.pdf`);
  };

  const guardarFirma = () => {
    setFirmaURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
  };

  const limpiarFirma = () => {
    sigCanvas.current.clear();
    setFirmaURL(null);
  };

  return (
    <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto my-6 border border-gray-300">
      <h2 className="text-center text-xl font-bold mb-4 underline">CONTRATO DE ARRENDAMIENTO DE APARTAMENTO</h2>
      <p className="mb-2"><b>Entre las partes:</b></p>
      <p className="mb-2">ARRENDADOR: <span className="border-b border-gray-400 px-12"></span></p>
      <p className="mb-2">ARRENDATARIO: <b>{contrato.nombre_inquilino}</b></p>
      <p className="mb-2">Apartamento: <b>{contrato.codigo_apartamento}</b></p>
      <p className="mb-2">Valor mensual: <b>${contrato.valor_apartamento}</b></p>
      <p className="mb-2">Frecuencia de pago: <b>{contrato.frecuencia}</b></p>
      <p className="mb-2">Fecha de inicio: <b>{contrato.fecha_inicio}</b></p>
      <p className="mb-4">Fecha de finalización: <b>{contrato.fecha_fin}</b></p>
      <h3 className="font-semibold mt-4 mb-2">CLÁUSULAS</h3>
      <ol className="list-decimal list-inside mb-4 text-justify space-y-1">
        <li>El arrendatario se compromete a pagar el canon de arrendamiento en la frecuencia y valor establecidos.</li>
        <li>El apartamento será destinado exclusivamente para uso habitacional.</li>
        <li>El arrendatario deberá mantener el inmueble en buen estado y responderá por los daños ocasionados.</li>
        <li>El contrato tendrá una duración desde la fecha de inicio hasta la fecha de finalización, salvo prórroga o terminación anticipada conforme a la ley.</li>
        <li>Cualquier controversia será resuelta conforme a la legislación vigente.</li>
      </ol>
      <div className="mt-6">
        <p className="mb-2 font-semibold">Firma digital del arrendatario:</p>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 300, height: 100, className: "border" }}
          ref={sigCanvas}
        />
        <div className="flex gap-2 mt-2">
          <button onClick={guardarFirma} className="bg-green-500 text-white px-2 py-1 rounded">Guardar Firma</button>
          <button onClick={limpiarFirma} className="bg-gray-400 text-white px-2 py-1 rounded">Limpiar</button>
        </div>
        {firmaURL && (
          <div className="mt-2">
            <img src={firmaURL} alt="Firma" style={{ border: "1px solid #ccc" }} />
          </div>
        )}
      </div>
      <div className="mt-6">
        <button onClick={generarPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
          Descargar Contrato PDF
        </button>
      </div>
    </div>
  );
}