import React, {useState, useEffect} from 'react';
import {db} from '../firebaseConfig';
import {collection, getDocs} from 'firebase/firestore';


const PagosTotales = () => {
    const [pagos, setPagos] = useState([]);
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroInquilino, setFiltroInquilino] = useState('');
    const [filtroApartamento, setFiltroApartamento] = useState('');
    const [pagosFiltrados, setPagosFiltrados] = useState([]);

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
                if (pago.nombre_inquilino) {
                    return pago.nombre_inquilino.toLowerCase().includes(filtroInquilino.toLowerCase())
                }
                return false;
            });
        }

        if (filtroApartamento) {
            pagosFiltrados = pagosFiltrados.filter(pago => {
                if (pago.codigo_apartamento) {
                    return pago.codigo_apartamento.toLowerCase().includes(filtroApartamento.toLowerCase())
                }
                return false;

            });
        }
        console.log('pagosFiltrados:', pagosFiltrados);

        setPagosFiltrados(pagosFiltrados);
    };

    return (
        <div className="p-2 sm:p-6">
            <h2 className="text-2xl font-semibold mb-4">Pagos Totales</h2>


            <div className="flex flex-col">
                <label htmlFor="filtroFecha" className="text-sm font-medium text-gray-700 mb-1">
                    Fecha:
                </label>
                <input
                    type="date"
                    id="filtroFecha"
                    value={filtroFecha}
                    onChange={e => setFiltroFecha(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="filtroInquilino" className="text-sm font-medium text-gray-700 mb-1">
                    Inquilino:
                </label>
                <input
                    type="text"
                    id="filtroInquilino"
                    value={filtroInquilino}
                    onChange={e => setFiltroInquilino(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Buscar inquilino..."
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="filtroApartamento" className="text-sm font-medium text-gray-700 mb-1">
                    Apartamento:
                </label>
                <input
                    type="text"
                    id="filtroApartamento"
                    value={filtroApartamento}
                    onChange={e => setFiltroApartamento(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Buscar apartamento..."
                />
            </div>


            <div className="overflow-x-auto shadow-md rounded-lg mt-5">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Valor
                        </th>
                        <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Inquilino
                        </th>
                        <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Apartamento
                        </th>
                        <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Método de Pago
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {pagosFiltrados.map(pago => (
                        <>
                            <tr key={pago.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {pago.fecha_pago && typeof pago.fecha_pago.toDate === 'function'
                                        ? pago.fecha_pago.toDate().toLocaleDateString()
                                        : ''}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    ${typeof pago.valor === 'number'
                                    ? pago.valor.toLocaleString()
                                    : pago.valor}
                                </td>
                                <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-900">
                                    {pago.nombre_inquilino}
                                </td>
                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">
                                    {pago.codigo_apartamento}
                                </td>
                                <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900">
                                    {pago.metodo_pago}
                                </td>
                            </tr>
                            {/* Información adicional para móviles */}
                            <tr className="sm:hidden bg-gray-50">
                                <td colSpan="2" className="px-4 py-2 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Inquilino:</span> {pago.nombre_inquilino}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Apartamento:</span> {pago.codigo_apartamento}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Método:</span> {pago.metodo_pago}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PagosTotales;