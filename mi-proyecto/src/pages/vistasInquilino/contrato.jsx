import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import jsPDF from "jspdf"; // Importar jsPDF


const Contrato = ({ userId }) => {
  const [contrato, setContrato] = useState(null);
  const [apartamento, setApartamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarPagos, setMostrarPagos] = useState(false);
  const [numFactura, setNumFactura] = useState("");

  useEffect(() => {
    const cargarDatosContrato = async () => {
      try {
        const contratoQuery = query(
          collection(db, "contratos"),
          where("id_inquilino", "==", userId)
        );
        const contratoSnapshot = await getDocs(contratoQuery);

        if (!contratoSnapshot.empty) {
          const contratoDoc = contratoSnapshot.docs[0];
          const contratoData = contratoDoc.data();
          setContrato({ id: contratoDoc.id, ...contratoData });

          const apartamentoQuery = query(
            collection(db, "apartamentos"),
            where("codigo", "==", contratoData.codigo_apartamento)
          );
          const apartamentoSnapshot = await getDocs(apartamentoQuery);

          if (!apartamentoSnapshot.empty) {
            const apartamentoData = apartamentoSnapshot.docs[0].data();
            setApartamento(apartamentoData);
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos del contrato:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosContrato();
  }, [userId]);

  const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("Número de cuenta copiado: " + texto);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar que exista un contrato
    if (!contrato) {
      alert("No se puede registrar el pago. No se encontró un contrato asociado.");
      return;
    }
  
    // Validar que el número de factura esté ingresado
    if (!numFactura) {
      alert("Por favor, ingresa el número de factura.");
      return;
    }
  
    try {
      // Crear una fecha con la hora ajustada a las 00:00:00
      const fechaActual = new Date();
      const fechaSinHora = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
  
      await addDoc(collection(db, "pagos"), {
        fecha_pago: fechaSinHora, // Guardar la fecha como tipo timestamp
        num_contrato: contrato?.id || "", // Guardar el número de contrato
        num_factura: numFactura, // Guardar el número de factura
      });
  
      alert("Pago registrado exitosamente.");
      setNumFactura(""); // Limpiar el campo de factura
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      alert("Hubo un error al registrar el pago. Inténtalo de nuevo.");
    }
  };

  const generarFactura = () => {
    const doc = new jsPDF();
  
    // Título de la factura
    doc.setFontSize(18);
    doc.text("Factura de Pago", 20, 20);
  
    // Información del contrato
    doc.setFontSize(12);
    doc.text(`Número de Contrato: ${contrato?.id || "No disponible"}`, 20, 40);
    doc.text(`Nombre del Inquilino: ${contrato?.nombre_inquilino || "No disponible"}`, 20, 50);
    doc.text(`Apartamento: ${contrato?.codigo_apartamento || "No asignado"}`, 20, 60);
    doc.text(`Valor: $${contrato?.valor_apartamento || "0"}`, 20, 70);
  
    // Fecha de pago
    const fechaActual = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Fecha de Pago: ${fechaActual}`, 20, 80);
  
    // Guardar el archivo PDF
    doc.save(`Factura_${contrato?.id || "sin_id"}.pdf`);
  };


  if (loading) {
    return <p>Cargando datos del contrato...</p>;
  }

  return (
    <div className="p-8">
      {mostrarPagos ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pagos</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded shadow-md flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  <img
                    src="src\img\bancos\Bancolombia.png"
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

            <div className="bg-blue-100 p-4 rounded shadow-md flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  <img
                    src="src\img\bancos\davivienda.png"
                    alt="Davivienda"
                    className="w-10 h-10"
                    style={{ borderRadius: "50%" }}
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

            <div className="bg-blue-100 p-4 rounded shadow-md flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                  <img
                    src="src\img\bancos\nequi.webp"
                    alt="Nequi"
                    className="w-10 h-10"
                    style={{ borderRadius: "50%" }}
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


          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Registrar Pago</h3>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="contrato">
                  Número de Contrato
                </label>
                <input
                  type="text"
                  id="contrato"
                  value={contrato?.id || ""}
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="fechaPago">
                  Fecha de Pago
                </label>
                <input
                  type="text"
                  id="fechaPago"
                  value={new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="numFactura">
                  Número de Factura
                </label>
                <input
                  type="text"
                  id="numFactura"
                  value={numFactura}
                  onChange={(e) => setNumFactura(e.target.value)}
                  placeholder="Ingresa el número de factura"
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
              >
                Registrar Pago
              </button>
            </form>
          </div>

          <button
            className="mt-4 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={generarFactura}
          >
            Descargar Factura
          </button>

          <button
            className="mt-6 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={() => setMostrarPagos(false)}
          >
            Volver
          </button>
        </div>
      ) : (
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
              onClick={() => setMostrarPagos(true)}
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