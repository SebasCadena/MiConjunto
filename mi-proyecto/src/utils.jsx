import { Timestamp, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./pages/firebaseConfig";

function generar_cobros(contrato_data) {
  const { fecha_inicio, fecha_fin, valor_apartamento, id_contrato, id_inquilino } = contrato_data;
  const fecha_inicio_contrato = fecha_inicio.toDate(); // fecha inicio del contrato
  const fecha_fin_contrato = fecha_fin.toDate();// fecha de fin del contrato
  
  const valor_apartamento_num = parseFloat(valor_apartamento);
  let fecha_actual = new Date(fecha_inicio_contrato); // se crea una nueva variable con la fecha de inicio


  
  const cobros_a_crear = [];

  while (fecha_actual <= fecha_fin_contrato) {
    const ultimo_dia_mes = new Date(
      fecha_actual.getFullYear(),
      fecha_actual.getMonth() + 1,
      0
    ).getDate();
    const fecha_vencimiento = new Date(
      fecha_actual.getFullYear(),
      fecha_actual.getMonth(),
      ultimo_dia_mes,
      23,
      59,
      59
    );


      const cobro = {
        contratoId: id_contrato,
        estado: "Pendiente",
        mesCorrespondiente: fecha_actual.getMonth() + 1,
        añoCorrespondiente: fecha_actual.getFullYear(),
        valor_cobro: valor_apartamento_num,
        fecha_vencimiento: Timestamp.fromDate(fecha_vencimiento),
        num_factura: 0,
        fecha_pago: null,
        inquilinoID: id_inquilino,
        valor_pagado: null,
        metodo_pago: null,
        id_pago: null,
      };
    cobros_a_crear.push(cobro);

    // Avanzar al siguiente mes
    if (fecha_actual.getMonth() === 11) {
      fecha_actual = new Date(fecha_actual.getFullYear() + 1, 0, 1);
    } else {
      fecha_actual = new Date(
        fecha_actual.getFullYear(),
        fecha_actual.getMonth() + 1,
        1
      );
    }
  }

  return cobros_a_crear;
}


async function agregarCobros(cobros) {
    try {
      for (const cobro of cobros) {
        const cobroRef = collection(db, "cobros");
        await addDoc(cobroRef, cobro);
      }
      console.log("Cobros agregados correctamente");
    } catch (error) {
      console.error("Error al agregar cobros:", error);
    }
  }
  
async function getContratos(inquilinoId = null) {
    try {
      const contratosRef = collection(db, "contratos");

      // Crear una query para obtener solo los contratos con activo == true
      let q = query(contratosRef, where("activo", "==", true));
      //Si el inquilinoId es enviado, se filtran los contratos
      if (inquilinoId) {
        q = query(contratosRef, where("id_inquilino", "==", inquilinoId), where("activo", "==", true));
      }
      
      // Obtener los documentos de la query en vez de toda la coleccion
      const querySnapshot = await getDocs(q);
      const contratos = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const contrato = { id: doc.id, ...doc.data() };
          // Obtener los cobros asociados a este contrato
          const cobrosRef = collection(db, "cobros");
          const q = query(cobrosRef, where("contratoId", "==", contrato.id));
          const cobrosSnapshot = await getDocs(q);
          const cobros = cobrosSnapshot.docs.map((cobroDoc) => ({
            id: cobroDoc.id,
            ...cobroDoc.data(),
          }));
          contrato.cobros = cobros; // Agregar los cobros al contrato
          return contrato;
        })
      );
      return contratos;
    } catch (error) {
        console.error("Error al obtener contratos:", error);
        return []; // Retorna un array vacío en caso de error
    }
}  

async function actualizarEstadoCobros() {
  try {
    const cobrosRef = collection(db, "cobros");
    const q = query(cobrosRef, where("estado", "==", "Pendiente"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docSnap) => {
      const cobro = docSnap.data();
      const fechaVencimiento = cobro.fecha_vencimiento.toDate();      
      if (fechaVencimiento < new Date() && cobro.estado !== "Pagado") {
          const cobroRef = doc(db, "cobros", docSnap.id);
          await updateDoc(cobroRef, { estado: "Vencido" });
          console.log(`Cobro ${docSnap.id} actualizado a Vencido`);
      }  
    });
  } catch (error) {
    console.error("Error al actualizar el estado de los cobros:", error);
  }
}

async function registrarPago(id_cobro, valor_pagado, metodo_pago) {
  const fechaActual = new Date();// Obtener la fecha actual
  try {
    // Crear un nuevo documento en la colección 'pagos'
    const pagoRef = collection(db, 'pagos');
    const cobroRefDoc = doc(db, 'cobros', id_cobro);
    const cobroSnap = await getDoc(cobroRefDoc);
    const cobro = cobroSnap.data()

    const nuevoPago = {
      cobroID: id_cobro,
      montoPagado: valor_pagado,
      metodoPago: metodo_pago,
      fecha_pago: Timestamp.fromDate(fechaActual),
      inquilinoID: cobro.inquilinoID,
    };
    const pagoDocRef = await addDoc(pagoRef, nuevoPago);
    const id_pago = pagoDocRef.id;

    // Actualizar el cobro asociado
    const cobroRef = doc(db, "cobros", id_cobro);
    await updateDoc(cobroRef, {
      fecha_pago: Timestamp.fromDate(fechaActual),
      valor_pagado: valor_pagado,
      metodo_pago: metodo_pago,
      id_pago: id_pago,
      estado: "Pagado",
    });
  } catch (error) {
    console.error("Error al registrar el pago:", error);
  }
}

export { generar_cobros, agregarCobros, getContratos, actualizarEstadoCobros, registrarPago };