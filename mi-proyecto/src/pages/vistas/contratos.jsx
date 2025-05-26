import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig.js";
import { generar_cobros, agregarCobros, getContratos, actualizarEstadoCobros } from "../../utils.jsx";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  query,
  where,
  onSnapshot, 
  orderBy,
} from "firebase/firestore";

export default function Contratos() {
  const [apartamentos, setApartamentos] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [contratos, setContratos] = useState([]); // Estado para almacenar los contratos
  const [codigoApartamento, setCodigoApartamento] = useState("");
  const [idContrato, setIdContrato] = useState("");
  const [valorApartamento, setValorApartamento] = useState("");
  const [idInquilino, setIdInquilino] = useState("");
  const [nombreInquilino, setNombreInquilino] = useState("");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [fechaInicio, setFechaInicio] = useState("");
  const [mesesContrato, setMesesContrato] = useState("");
  

  useEffect(() => {
    const obtenerDatos = async () => {      
      const contratosData = await getContratos();
      setContratos(contratosData);

      try {
        // Obtener apartamentos
        const aptoSnapshot = await getDocs(
          query(collection(db, "apartamentos"), where("ocupacion", "==", false), where("activo", "==", true))
        );
        const apartamentosData = aptoSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((apto) => apto.ocupacion === false); // Filtrar apartamentos con ocupacion = false
        console.log("Apartamentos disponibles:", apartamentosData);
        setApartamentos(apartamentosData);

        // Obtener inquilinos
        const inquilinoSnapshot = await getDocs(query(collection(db, "users"), where("activo", "==", true)));
        const inquilinosData = inquilinoSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.rol === "inquilino"); // Filtrar solo inquilinos
        console.log("Inquilinos:", inquilinosData);
        setInquilinos(inquilinosData);

       console.log("Contratos activos:", contratosData); // Muestra solo los contratos activos
        setContratos(contratosData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };


    obtenerDatos();

    actualizarEstadoCobros();

    // Configurar listener en tiempo real para la colección 'cobros'
    const unsubscribe = onSnapshot(collection(db, "cobros"), () => {
      // Llamar a getContratos() para actualizar la lista de contratos
      getContratos().then(contratosData => {
        setContratos(contratosData);        
      });
    });
    return () => unsubscribe();
  }, []);

  const añadirContratoFunction = async () => {
    if (!codigoApartamento || !idInquilino || !frecuencia || !fechaInicio || !mesesContrato) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }

    if (isNaN(Number(mesesContrato)) || mesesContrato <= 0) {
      alert("Por favor, ingrese una cantidad de meses válida.");
      return;
    }
    
    try {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinCalculada = new Date(fechaInicioDate);
      fechaFinCalculada.setMonth(fechaInicioDate.getMonth() + Number(mesesContrato));


      let contrato = {}
      let cobrosAGuardar = [];

      // Guardar contrato en Firestore

      await addDoc(collection(db, "contratos"), {
        codigo_apartamento: codigoApartamento,
        valor_apartamento: valorApartamento,
        id_inquilino: idInquilino,
        nombre_inquilino: nombreInquilino,
        frecuencia,
        fecha_inicio: Timestamp.fromDate(fechaInicioDate),
        fecha_fin: Timestamp.fromDate(fechaFinCalculada),
        activo: true,
      }).then((docRef) => {
        // Accede al ID generado aquí        
         contrato = {
          id_contrato: docRef.id,
          codigo_apartamento: codigoApartamento,
          valor_apartamento: valorApartamento,
          id_inquilino: idInquilino,
          nombre_inquilino: nombreInquilino,
          frecuencia,
          fecha_inicio: Timestamp.fromDate(fechaInicioDate),
          fecha_fin: Timestamp.fromDate(fechaFinCalculada),
          activo: true,
        }
        cobrosAGuardar = generar_cobros(contrato);
        agregarCobros(cobrosAGuardar);

      });

      // Actualizar estado del apartamento a ocupado
      const apartamentoRef = doc(db, "apartamentos", codigoApartamento);
      await updateDoc(apartamentoRef, { ocupacion: true });

      alert("Contrato guardado exitosamente");
      setCodigoApartamento("");
      setValorApartamento("");
      setIdInquilino("");
      setNombreInquilino("");
      setFrecuencia("mensual");
      setFechaInicio("");
      setMesesContrato("");      
    } catch (error) {
      console.error("Error al guardar el contrato:", error);
      alert("Hubo un error al guardar el contrato.");
    }
  };

  const finalizarContratoFunction = async (idContrato) => {
    try {
      // 1. Obtener el contrato para acceder al código del apartamento
      const contratoRef = doc(db, "contratos", idContrato);
      const contratoSnap = await getDoc(contratoRef);      
      const contratoData = contratoSnap.data();
      const codigoApartamento = contratoData.codigo_apartamento; // Cambio de nombre de variable

      // 2. Cambiar el estado del contrato a inactivo
      await updateDoc(contratoRef, { activo: false });

      // 3. Actualizar el estado de ocupación del apartamento a falso
      const apartamentoRef = doc(db, "apartamentos", codigoApartamento);
      await updateDoc(apartamentoRef, { ocupacion: false });


      // Actualizar la lista de contratos
      const contratosData = await getContratos();
      setContratos(contratosData);
      

      alert("Contrato finalizado exitosamente.");
    } catch (error) {
      console.error("Error al finalizar el contrato:", error);
      alert("Hubo un error al finalizar el contrato.");
    }
  };

  return (
    <div className="p-2 mx-auto rounded-lg">
      <h2 className="text-center text-lg font-semibold mb-4">Añadir / Modificar Contrato</h2>

      {/* Selector de apartamentos */}      
      <div className="flex gap-2 mb-4">
        <button className="bg-blue-400 text-white px-4 py-2 rounded w-1/3">Asignar Apto</button>
        <select
          className="bg-white p-2 rounded w-2/3"
          value={codigoApartamento}
          onChange={(e) => {
            const selected = apartamentos.find((apto) => apto.codigo === e.target.value);
            setCodigoApartamento(e.target.value);
            setValorApartamento(selected?.valor || "");
          }}
        >
          <option value="">Seleccionar</option>
          {apartamentos.map((apto) => (
            <option key={apto.id} value={apto.codigo}>
              {apto.codigo} - {apto.direccion || "Sin dirección"}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar valor del apartamento */}
      {valorApartamento && (
        <div className="mb-4">
          <input
            type="text"
            className="bg-gray-200 p-2 rounded w-full"
            value={`Valor: $${valorApartamento}`}
            readOnly
          />
        </div>
      )}

      {/* Selector de inquilinos */}
      <div className="flex gap-2 mb-4">
        <button className="bg-blue-400 text-white px-4 py-2 rounded w-1/3">Inquilino</button>
        <select
          className="bg-white p-2 rounded w-2/3"
          value={idInquilino}
          onChange={(e) => {
            const selected = inquilinos.find((i) => i.id === e.target.value);
            setIdInquilino(e.target.value);
            setNombreInquilino(selected?.nombre || "");
          }}
        >
          <option value="">Seleccionar</option>
          {inquilinos.map((inq) => (
            <option key={inq.id} value={inq.id}>
              {inq.nombre} - {inq.email}
            </option>
          ))}
        </select>
      </div>

      {/* Frecuencia */}
      <div className="mb-4">
        <select
          className="bg-white p-2 rounded w-full"
          value={frecuencia}
          onChange={(e) => setFrecuencia(e.target.value)}
        >
          <option value="mensual">Mensual</option>
          <option value="bimestral">Bimestral</option>
          <option value="semestral">Semestral</option>
        </select>
      </div>

       {/* Fechas y meses*/}
       <div className="flex gap-2 mb-4 items-center">
        <div className="w-1/2">
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
            Fecha Inicio
          </label>
          <input
            type="date"
            id="fechaInicio"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700">Meses Contrato</label>
          <input type="number" className="mt-1 p-2 border border-gray-300 rounded w-full" value={mesesContrato} onChange={(e) => setMesesContrato(e.target.value)}/>
        </div>
      </div>

      {/* Botón para guardar */}
      <div className="mt-6 text-center">
        <button onClick={añadirContratoFunction} className="bg-green-500 text-white px-6 py-2 rounded">
          Guardar Contrato
        </button>
      </div>

      {/* Lista de contratos */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Contratos Existentes</h3>
        {contratos.filter(contrato => contrato.activo).length === 0 ? (
          <p className="text-gray-600">No hay contratos registrados.</p>
        ) : (
          <ul className="space-y-4">
            {contratos.map((contrato) => (
              <li
                key={contrato.id}
                className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
                // Make list item stack vertically on small screens
              >
                <div className="flex-1 mb-4 sm:mb-0"> {/* Allow text content to take available space */}
                  <p className="font-bold">Apartamento: {contrato.codigo_apartamento}</p>
                  <p>Inquilino: {contrato.nombre_inquilino}</p>
                  <p>Frecuencia: {contrato.frecuencia}</p>
                  <p>
                    Fechas: {contrato.fecha_inicio.toDate().toLocaleDateString()} -{" "}
                  </p>                  
                  {/* Aquí podrías mostrar más detalles del contrato si es necesario */}
                </div>
                {/* Stack buttons vertically on small screens */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => finalizarContratoFunction(contrato.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Finalizar Contrato
                  </button>
                  {/* Otros botones o acciones aquí */}
                    
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}