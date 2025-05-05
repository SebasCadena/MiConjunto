import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { getContratos, registrarPago } from '../../utils'; // Importa las funciones necesarias
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';

function Contrato({ userId }) {
  const [contrato, setContrato] = useState(null);
  const [apartamento, setApartamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cobros, setCobros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cobroSeleccionado, setCobroSeleccionado] = useState(null);
  const [valorPagado, setValorPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const mesActual = new Date().getMonth() + 1;

  useEffect(() => {
    // Añadir fecha actual
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      setFechaPago(formattedDate);
  
    
    


    const cargarDatosContrato = async () => {
      try {
        const contratosData = await getContratos(userId); // Usamos la función getContratos de utils.jsx
        if (contratosData.length > 0) {
          const contratoData = contratosData[0]; // Tomamos el primer contrato, ya que debería ser el único para este inquilino
          setContrato(contratoData);
          // Procesar los cobros para identificar atrasados
          const cobrosConEstado = contratoData.cobros.map((cobro) => {
            const fechaVencimiento = cobro.fecha_vencimiento.toDate();
            const fechaActual = new Date();

            // Verificar si el cobro está vencido y no ha sido pagado
            const estaAtrasado =
              fechaVencimiento < fechaActual && cobro.estado !== 'Pagado';

            return { ...cobro, atrasado: estaAtrasado };
          });

          // Ordenar los cobros por año y mes de forma descendente
          cobrosConEstado.sort((a, b) => {            
            if (a.añoCorrespondiente !== b.añoCorrespondiente){
               return a.añoCorrespondiente - b.añoCorrespondiente
            }
             return a.mesCorrespondiente - b.mesCorrespondiente
          });

          setCobros(cobrosConEstado);


          // Buscar el apartamento por el código
          const apartamentoQuery = query(
            collection(db, 'apartamentos'),
            where('codigo', '==', contratoData.codigo_apartamento)
          );
          const apartamentoSnapshot = await getDocs(apartamentoQuery);

          if (!apartamentoSnapshot.empty) {
            const apartamentoData = apartamentoSnapshot.docs[0].data();
            setApartamento(apartamentoData);
          } else {
            setApartamento({ codigo: 'No encontrado', direccion: 'No encontrada' });
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

  const handleOpenModal = (cobro) => {
    setCobroSeleccionado(cobro);
    setValorPagado(cobro.valor_cobro);
    setShowModal(true);
    setError('');
    setMensaje('')
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCobroSeleccionado(null);
  };

  const handleRegistrarPago = async () => {
    if (!valorPagado || !metodoPago || !fechaPago) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await registrarPago(cobroSeleccionado.id, valorPagado, metodoPago); // Usamos la función registrarPago de utils.jsx
      setMensaje('Pago registrado correctamente.');

       //Actualizamos el valor de cobros
       const contratosData = await getContratos(userId);
       if (contratosData.length > 0) {
         const contratoData = contratosData[0];
         setCobros(contratoData.cobros || []);
       }

       setTimeout(() => {
        handleCloseModal();
        setValorPagado('');
        setMetodoPago('');
        setFechaPago('');
      }, 1000);


    } catch (error) {
      setError('Error al registrar el pago.');
      console.error('Error al registrar el pago:', error);
    }
  };

  if (loading) {
    return <p>Cargando datos del contrato...</p>;
  }

  return (
    <div className="p-8">
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Villa Campestre</h1>
        </div>

        <div className="bg-white p-6 rounded shadow-md text-center mb-6">
          <p className="text-lg font-semibold">
            Apartamento: {apartamento?.codigo || 'No asignado'}
          </p>
          <p className="text-gray-600">
            Dirección: {apartamento?.direccion || 'No disponible'}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow-md flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mr-4"></div>
            <div>
              <p className="font-bold">
                {contrato?.nombre_inquilino || 'Nombre no disponible'}
              </p>
              <p className="text-gray-600">
                N° Contrato: {contrato?.id || 'No asignado'}
              </p>
              <p className="text-gray-600">
                Apartamento: {contrato?.codigo_apartamento || 'No asignado'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">
              Total: ${contrato?.valor_apartamento || '0'}
            </p>
          </div>
        </div>

        {/* Mostrar Cobros */}
        <h3 className="text-lg font-semibold mb-4">Cobros:</h3>
        {cobros.length === 0 ? (
          <p>No hay cobros asociados al contrato.</p>
        ) : (
          <ul className="space-y-4">
            {cobros.map((cobro) => (
              <li
                key={cobro.id}
                className={`p-4 rounded shadow flex justify-between items-center ${
                  cobro.mesCorrespondiente === mesActual ? 'bg-yellow-200' : cobro.atrasado ? 'bg-red-200' : 'bg-gray-100'
                }`}
              >
                <div>
                  <p>
                  {cobro.mesCorrespondiente === mesActual ? (
                      <span className="font-bold">Mes Actual - </span>
                    ) : (
                      <span>Mes: </span>
                    )}
                    Mes: {cobro.mesCorrespondiente} - Año: {cobro.añoCorrespondiente}
                  </p>
                  <p>Valor: ${cobro.valor_cobro}</p>
                  <p>Estado: {cobro.estado}</p>
                </div>
                {(cobro.estado === 'Pendiente' || cobro.estado === 'Vencido') && (
                  <button
                    onClick={() => handleOpenModal(cobro)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Pagar
                  </button>
                )}
                {cobro.estado === 'Pagado' && (
                 <div>
                  <p>Valor pagado: ${cobro.valor_pagado}</p>
                  <p>Metodo pago: {cobro.metodo_pago}</p>
                  <p>Fecha pago: {cobro.fecha_pago.toDate().toLocaleDateString()}</p>
                </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Modal de Pago */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button
                  type="button"
                  className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                  onClick={handleCloseModal}
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-6 text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Registrar pago</h3>
                  {error && <p className="text-red-500">{error}</p>}
                  {mensaje && <p className="text-green-500">{mensaje}</p>} 
                  <div className="mb-4">
                    <label htmlFor="valorPagado" className="block text-gray-700 text-sm font-bold mb-2">
                      Valor Pagado
                    </label>
                    <input
                      type="number"
                      readOnly
                      id="valorPagado"
                      value={valorPagado}
                      onChange={(e) => setValorPagado(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      disabled
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="metodoPago"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Método de Pago
                    </label>
                    <select
                        id="metodoPago"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="" >Selecciona un método de pago</option>
                        <option value="nequi">Nequi</option>
                        <option value="davivienda">Davivienda</option>
                        <option value="bancolombia">Bancolombia</option>
                      </select>
                  </div>
                  <div className="mb-4">
                     <label
                      htmlFor="fechaPago"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Fecha de Pago
                    </label>
                    <input type="text" readOnly value={fechaPago} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>                  </div>
                  <button
                    onClick={handleRegistrarPago}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:shadow-outline"
                  >
                    Registrar
                  </button>
                </div>
              </div>
            </div>  
          </div> 
        )}
      </div> 
    </div>
  );
}

export default Contrato;