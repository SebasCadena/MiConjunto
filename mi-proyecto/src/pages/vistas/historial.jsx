
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

    const Historial = () => {
      const [contratos, setContratos] = useState([]);
    
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
    
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Historial de Contratos</h2>
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {contratos.map((contrato) => (
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
