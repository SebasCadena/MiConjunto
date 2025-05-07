import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';


const PagosTotales = () => {
  const [pagos, setPagos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroInquilino, setFiltroInquilino] = useState('');  const [filtroApartamento, setFiltroApartamento] = useState('');  const [pagosFiltrados, setPagosFiltrados] = useState([]);

  useEffect(() => {
    obtenerPagos();
  }, []);

  useEffect(() => {
    filtrarPagos();
  }, [pagos, filtroFecha, filtroInquilino, filtroApartamento]);

  const obtenerPagos = async () => {
    try {
      const cobrosSnapshot = await getDocs(collection(db, 'cobros'));
      const cobrosData = cobrosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const contratosSnapshot = await getDocs(collection(db, 'contratos'));
      const contratosData = contratosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const contratosMap = {};
      contratosData.forEach(contrato => {
        contratosMap[contrato.id] = contrato;
      });

      let allPagos = [];
      for (const cobro of cobrosData) {
        if (cobro.id_pago !== null) {
          const contrato = contratosMap[cobro.contratoId];
          if (contrato) {
            const pago = {
              id: cobro.cobroID, // Usar el cobroID como id
              fecha_pago: cobro.fecha_pago,
              valor: cobro.montoPagado,
              nombre_inquilino: contrato.nombre_inquilino,
              codigo_apartamento: contrato.codigo_apartamento,
               metodo_pago: cobro.metodoPago,
            };
            allPagos.push(pago);
          }
        
        }
          
      }

       console.log('allPagos:', allPagos);
      
      setPagos(allPagos);
    } catch (error) {
      console.error('Error al obtener los pagos:', error);
    } 
  };

  const filtrarPagos = () => {
    let pagosFiltrados = [...pagos];
    console.log('filtroFecha:', filtroFecha);

    if (filtroFecha) {
      pagosFiltrados = pagosFiltrados.filter(pago => {
        if (pago.fecha_pago && typeof pago.fecha_pago.toDate === 'function') {
          const fechaPago = pago.fecha_pago.toDate().toISOString().slice(0, 10);
          return fechaPago === filtroFecha;
        }
        return false;
      });
    } else {
      pagosFiltrados = pagosFiltrados;
    }

    if (filtroInquilino) {
        pagosFiltrados = pagosFiltrados.filter(pago => {
        if(pago.nombre_inquilino){
          return pago.nombre_inquilino.toLowerCase().includes(filtroInquilino.toLowerCase())
        }
        return false;
      });
    }

    if (filtroApartamento) {
        pagosFiltrados = pagosFiltrados.filter(pago => {
        if(pago.codigo_apartamento){
          return pago.codigo_apartamento.toLowerCase().includes(filtroApartamento.toLowerCase())
        } 
       return false;
        
      }); 
    }   console.log('pagosFiltrados:', pagosFiltrados);

    setPagosFiltrados(pagosFiltrados);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Pagos Totales</h2>
      

      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="filtroFecha">Fecha:</label>
          <input type="date" id="filtroFecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
        </div>
        <div>
          <label htmlFor="filtroInquilino">Inquilino:</label>
          <input type="text" id="filtroInquilino" value={filtroInquilino} onChange={e => setFiltroInquilino(e.target.value)} />
        </div>
        <div>
          <label htmlFor="filtroApartamento">Apartamento:</label>
          <input type="text" id="filtroApartamento" value={filtroApartamento} onChange={e => setFiltroApartamento(e.target.value)} />
        </div>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Fecha</th>
             <th className="py-2 px-4 border-b">Valor</th>
            <th className="py-2 px-4 border-b">Inquilino</th>
            <th className="py-2 px-4 border-b">Apartamento</th>            
             <th className="py-2 px-4 border-b">Método de Pago</th>
          </tr>
        
        </thead>
        <tbody>
          {pagosFiltrados.map(pago => (
            <tr key={pago.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                {pago.fecha_pago && typeof pago.fecha_pago.toDate === 'function' ? pago.fecha_pago.toDate().toLocaleDateString(): ''}
              </td>
              <td className="py-2 px-4 border-b">{pago.valor}</td>   
              <td className="py-2 px-4 border-b">{pago.nombre_inquilino}</td> 
              <td className="py-2 px-4 border-b">{pago.codigo_apartamento}</td>
               <td className="py-2 px-4 border-b">{pago.metodo_pago}</td>
          
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PagosTotales;
