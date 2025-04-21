import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PanelDueño from "./pages/PanelDueño";
import PanelInquilino from "./pages/PanelInquilino";
import ProtectedRoute from "./components/ProtectedRoute";
import { FirestoreProvider } from "./context/FirestoreContext"; // Importa el FirestoreProvider
import { useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./pages/firebaseConfig";

const App = () => {
  useEffect(() => {
    const checkContractExpiration = async () => {
      try {
        const contratosCollection = collection(db, "contratos");
        const contratosSnapshot = await getDocs(contratosCollection);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the day for comparison

        contratosSnapshot.forEach(async (contratoDoc) => {
          const contrato = contratoDoc.data();
          const fechaFinTimestamp = contrato.fecha_fin;

          if (fechaFinTimestamp) {
            const fechaFin = fechaFinTimestamp.toDate();
            fechaFin.setHours(0, 0, 0, 0); // Ensure consistent time for comparison

            if (fechaFin < today && contrato.activo !== false) {
              // Update the contract status to inactive
              const contratoRef = doc(db, "contratos", contratoDoc.id);
              await updateDoc(contratoRef, { activo: false });
              console.log(
                `Contrato ${contratoDoc.id} finalizado. Estado actualizado a inactivo.`
              );
            }
          }
        });
      } catch (error) {
        console.error(
          "Error al verificar las fechas de vencimiento de los contratos:",
          error
        );
      }
    };
    checkContractExpiration();
  }, []);
  return (
    <FirestoreProvider> {/* Envuelve toda la aplicación */}
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dueño"
          element={
            <ProtectedRoute requiredRole="dueño">
              <PanelDueño />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inquilino"
          element={
            <ProtectedRoute requiredRole="inquilino">
              <PanelInquilino />
            </ProtectedRoute>
          }
        />
      </Routes>
    </FirestoreProvider>
  );
};

export default App;