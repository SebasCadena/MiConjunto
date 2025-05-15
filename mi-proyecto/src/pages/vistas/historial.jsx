
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const Historial = () => {
  const [contratos, setContratos] = useState([]);
  const [filtroApartamento, setFiltroApartamento] = useState("");
  const [filtroInquilino, setFiltroInquilino] = useState("");

  useEffect(() => {
        const obtenerContratosInactivos = async () => {
          try {
            const q = query(collection(db, "contratos"), where("activo", "==", false));
            const querySnapshot = await getDocs(q);
            const contratosData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
      
              // Obtener datos adicionales de inquilinos y apartamentos
              const contratosConDatos = await Promise.all(
                contratosData.map(async (contrato) => {
                  try {
                    // Obtener datos del inquilino
                    const inquilinoRef = doc(collection(db, "users"), contrato.id_inquilino);
                    const inquilinoSnap = await getDoc(inquilinoRef);
                    const inquilinoData = inquilinoSnap.exists() ? inquilinoSnap.data() : {};
      
                    // Obtener datos del apartamento
                    const apartamentoRef = doc(collection(db, "apartamentos"), contrato.codigo_apartamento);
                    const apartamentoSnap = await getDoc(apartamentoRef);
                    const apartamentoData = apartamentoSnap.exists() ? apartamentoSnap.data() : {};
      
                    return {
                      ...contrato,
                      inquilino: inquilinoData,
                      apartamento: apartamentoData,
                    };
                  } catch (error) {
                    console.error("Error al obtener datos adicionales:", error);
                    return contrato; // Retornar el contrato sin modificar en caso de error
                  }
                })
              );
      
              setContratos(contratosConDatos);
          } catch (error) {
            console.error("Error al obtener los contratos inactivos:", error);
            // Considerar un estado de error para mostrar al usuario
          }
        };
    
        obtenerContratosInactivos();
      }, []);
    
      // Obtener todos los apartamentos y inquilinos para los filtros
  const apartamentos = [...new Set(contratos.map(c => c.codigo_apartamento))];
  const inquilinos = [...new Set(contratos.map(c => c.nombre_inquilino))];

  // Filtrar contratos
  const contratosFiltrados = contratos.filter(contrato => {
    const filtroApto = !filtroApartamento || contrato.codigo_apartamento === filtroApartamento;
    const filtroInq = !filtroInquilino || contrato.nombre_inquilino === filtroInquilino;
    return filtroApto && filtroInq;
  });

      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Historial de Contratos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Filtro por Apartamento */}
                <div className="w-full">
                    <label
                        htmlFor="filtro-apartamento"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Filtrar por Apartamento
                    </label>
                    <div className="relative">
                        <select
                            id="filtro-apartamento"
                            name="filtro-apartamento"
                            className="w-full px-3 py-2 text-sm border border-gray-300
                         rounded-md shadow-sm appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 bg-white"
                            value={filtroApartamento}
                            onChange={(e) => setFiltroApartamento(e.target.value)}
                        >
                            <option value="">Todos los apartamentos</option>
                            {apartamentos.map(apto => (
                                <option key={apto} value={apto}>
                                    {apto}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filtro por Inquilino */}
                <div className="w-full">
                    <label
                        htmlFor="filtro-inquilino"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Filtrar por Inquilino
                    </label>
                    <div className="relative">
                        <select
                            id="filtro-inquilino"
                            name="filtro-inquilino"
                            className="w-full px-3 py-2 text-sm border border-gray-300
                         rounded-md shadow-sm appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 bg-white"
                            value={filtroInquilino}
                            onChange={(e) => setFiltroInquilino(e.target.value)}
                        >
                            <option value="">Todos los inquilinos</option>
                            {inquilinos.map(inquilino => (
                                <option key={inquilino} value={inquilino}>
                                    {inquilino}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
          {contratos.length === 0 ? (
            <p>No hay contratos en el historial.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apartamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección Apartamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Apartamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inquilino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Inquilino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frecuencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inicio Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fin Contrato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{contratosFiltrados.map((contrato) => (
                    <tr key={contrato.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contrato.codigo_apartamento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{contrato.apartamento.direccion || "No disponible"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contrato.apartamento.valor ? `$${contrato.apartamento.valor}` : "No disponible"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {contrato.nombre_inquilino}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{contrato.inquilino.email || "No disponible"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contrato.frecuencia}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contrato.fecha_inicio.toDate().toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contrato.fecha_fin.toDate().toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    };

export default Historial;
